import { TreeNode, TreeNodeSource } from '@/core/models/Tree';

/**
 * Live per-file state to splice into a structural tree when serializing it for
 * a save payload. Keyed by `nodeId`. Kept store-agnostic on purpose so this
 * stays a pure function with no `BitriseYmlStore` import.
 */
type LiveContents = Record<string, { contents: string; version: string }>;

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
      version: liveNode?.version ?? node.version,
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

export default {
  walk,
  findNode,
  flatten,
  serializeTree,
  sourceLabel,
  fileName,
};
