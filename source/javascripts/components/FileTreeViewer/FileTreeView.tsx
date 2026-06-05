import { BitkitTreeView, createTreeCollection, IconFileDoc, IconLock } from '@bitrise/bitkit-v2';
import { useMemo } from 'react';

import { TreeNode } from '@/core/models/Tree';
import TreeService from '@/core/services/TreeService';

// The tree-view renders the root node's children, so callers pass a (possibly
// synthetic) root whose `includes` are the entries to show; this id keeps that
// wrapper out of selection/expansion.
export const SYNTHETIC_ROOT_ID = '__tree_root__';

type Props = {
  /** Root node whose `includes` are rendered as the tree. */
  rootNode: TreeNode;
  selectedNodeId?: string;
  onSelect: (nodeId: string) => void;
  /** Optional predicate to disable (non-selectable, greyed) individual nodes. */
  isNodeDisabled?: (node: TreeNode) => boolean;
};

/**
 * The shared file-tree rendering used by the "Open module" popover and the
 * global diff dialog's file switcher. Pure presentation: it renders `rootNode`'s
 * include graph as nested folders/files (lock icon + source label for read-only
 * cross-ref nodes) and reports selection.
 */
const FileTreeView = ({ rootNode, selectedNodeId, onSelect, isNodeDisabled }: Props) => {
  const collection = useMemo(
    () =>
      createTreeCollection<TreeNode>({
        rootNode,
        nodeToValue: (node) => node.nodeId,
        nodeToString: (node) => TreeService.fileName(node.path),
        nodeToChildren: (node) => node.includes,
        // The synthetic wrapper root is never disabled; otherwise defer to the
        // caller's predicate.
        isNodeDisabled: (node) => node.nodeId !== SYNTHETIC_ROOT_ID && (isNodeDisabled?.(node) ?? false),
      }),
    [rootNode, isNodeDisabled],
  );

  // Expand every container node by default so the whole graph is visible.
  const expandedValue = useMemo(() => {
    const branches = [SYNTHETIC_ROOT_ID];
    TreeService.walk(rootNode, (node) => {
      if (node.includes.length > 0) {
        branches.push(node.nodeId);
      }
    });
    return branches;
  }, [rootNode]);

  return (
    <BitkitTreeView
      collection={collection}
      selectionMode="single"
      selectedValue={selectedNodeId ? [selectedNodeId] : []}
      defaultExpandedValue={expandedValue}
      onSelectionChange={(details) => {
        const nodeId = details.selectedValue[0];
        if (nodeId && nodeId !== SYNTHETIC_ROOT_ID) {
          onSelect(nodeId);
        }
      }}
      render={({ node, nodeState }) => {
        const label = TreeService.fileName(node.path);
        const refLabel = TreeService.sourceLabel(node.source);
        const lock = node.editable ? undefined : IconLock;

        return nodeState.isBranch ? (
          <BitkitTreeView.Branch label={label} suffixIcon={lock} suffixText={refLabel ?? undefined} />
        ) : (
          <BitkitTreeView.Leaf label={label} icon={IconFileDoc} suffixIcon={lock} suffixText={refLabel ?? undefined} />
        );
      }}
    />
  );
};

export default FileTreeView;
