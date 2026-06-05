import { TreeNode, TreeNodeSource } from '@/core/models/Tree';

/**
 * Live per-file state to splice into a structural tree when serializing it for
 * a save payload. Keyed by `nodeId`. `modified` marks files changed since load.
 * Kept store-agnostic on purpose so this stays a pure function with no
 * `BitriseYmlStore` import.
 */
type LiveContents = Record<string, { contents: string; modified: boolean }>;

type Visitor = (node: TreeNode, parent: TreeNode | undefined, depth: number) => void;

/**
 * Pre-order traversal of the include tree. Defensive against cycles (the merger
 * rejects them before serialization, but a malformed payload shouldn't hang).
 */
function walk(root: TreeNode | undefined, visitor: Visitor): void {
  if (!root) {
    return;
  }

  const seen = new Set<string>();

  const visit = (node: TreeNode, parent: TreeNode | undefined, depth: number) => {
    if (seen.has(node.nodeId)) {
      return;
    }
    seen.add(node.nodeId);

    visitor(node, parent, depth);
    node.includes.forEach((child) => visit(child, node, depth + 1));
  };

  visit(root, undefined, 0);
}

/** Find a node by its `nodeId`, or `undefined` if it isn't in the tree. */
function findNode(root: TreeNode | undefined, nodeId: string): TreeNode | undefined {
  let found: TreeNode | undefined;

  walk(root, (node) => {
    if (!found && node.nodeId === nodeId) {
      found = node;
    }
  });

  return found;
}

/** Flatten the tree to a pre-order list of nodes. */
function flatten(root: TreeNode | undefined): TreeNode[] {
  const nodes: TreeNode[] = [];
  walk(root, (node) => nodes.push(node));
  return nodes;
}

/**
 * Rebuild the structural tree into a fresh, wire-ready tree, splicing each
 * node's live `contents` + `version` from `live`. Nodes missing from `live`
 * keep their loaded contents (e.g. read-only nodes the user never touched).
 */
function serializeTree(root: TreeNode, live: LiveContents): TreeNode {
  const rebuild = (node: TreeNode): TreeNode => {
    const liveNode = live[node.nodeId];

    return {
      ...node,
      contents: liveNode?.contents ?? node.contents,
      modified: liveNode?.modified ?? false,
      includes: node.includes.map(rebuild),
    };
  };

  return rebuild(root);
}

/**
 * Short, human-readable badge for a node's cross-ref `source` — verbatim what
 * the user wrote in the `include:` directive. `null` for the root and for
 * same-repo/same-branch (path-only) includes, which carry no badge. Pinned refs
 * (commit / tag) take precedence over location refs (repository / branch).
 */
function sourceLabel(source: TreeNodeSource | null): string | null {
  if (!source) {
    return null;
  }
  if (source.commit) {
    return `commit: ${source.commit.slice(0, 7)}`;
  }
  if (source.tag) {
    return `tag: ${source.tag}`;
  }
  if (source.repository) {
    return `@${source.repository}`;
  }
  if (source.branch) {
    return `@${source.branch}`;
  }
  return null;
}

/** Basename of a node's repo-relative path, for display. */
function fileName(path: string): string {
  return path.split('/').filter(Boolean).pop() ?? path;
}

/**
 * The **effective** source badge for a node — its own `source`, or, for a
 * path-only include that inherits its parent's cross-ref (so it's read-only but
 * carries no `source` of its own), the nearest ancestor's source. Walking up the
 * include chain mirrors how `editable`/the effective ref tuple is inherited on
 * the backend, so a read-only child names the branch/tag/repo it was pulled from.
 */
function effectiveSourceLabel(root: TreeNode | undefined, nodeId: string): string | null {
  if (!root) {
    return null;
  }
  const find = (node: TreeNode, chain: TreeNode[]): TreeNode[] | null => {
    const next = [...chain, node];
    if (node.nodeId === nodeId) {
      return next;
    }
    for (const child of node.includes) {
      const found = find(child, next);
      if (found) {
        return found;
      }
    }
    return null;
  };
  const chain = find(root, []);
  if (!chain) {
    return null;
  }
  for (let i = chain.length - 1; i >= 0; i -= 1) {
    const label = sourceLabel(chain[i].source);
    if (label) {
      return label;
    }
  }
  return null;
}

export default {
  walk,
  findNode,
  flatten,
  serializeTree,
  sourceLabel,
  effectiveSourceLabel,
  fileName,
};
