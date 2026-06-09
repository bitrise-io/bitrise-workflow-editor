import { TreeNode, TreeNodeSource } from '@/core/models/Tree';

// Store-agnostic (no BitriseYmlStore import) so this stays a pure function.
type LiveContents = Record<string, { contents: string; modified: boolean }>;

type Visitor = (node: TreeNode, parent: TreeNode | undefined, depth: number) => void;

/** Pre-order traversal of the include tree; cycle-guarded so a malformed payload can't hang. */
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

function findNode(root: TreeNode | undefined, nodeId: string): TreeNode | undefined {
  let found: TreeNode | undefined;

  walk(root, (node) => {
    if (!found && node.nodeId === nodeId) {
      found = node;
    }
  });

  return found;
}

function flatten(root: TreeNode | undefined): TreeNode[] {
  const nodes: TreeNode[] = [];
  walk(root, (node) => nodes.push(node));
  return nodes;
}

/** Rebuild a fresh wire-ready tree, splicing each node's live contents; nodes missing from `live` keep their loaded contents. */
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

/** Cross-ref badge for a node's `source`; `null` for root and path-only includes. Pinned refs (commit/tag) win over location refs (repo/branch). */
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

function fileName(path: string): string {
  return path.split('/').filter(Boolean).pop() ?? path;
}

/** Effective source badge for a node: its own `source`, or the nearest ancestor's (a path-only include inherits its parent's cross-ref). */
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
