import { Tooltip } from '@bitrise/bitkit';
import { BitkitTreeView, createTreeCollection, IconFileYml, IconLock } from '@bitrise/bitkit-v2';
import { useMemo } from 'react';

import { TreeNode } from '@/core/models/Tree';
import TreeService from '@/core/services/TreeService';

// The tree-view renders the root node's children, so callers pass a (possibly
// synthetic) root whose `includes` are the entries to show; this id keeps that
// wrapper out of selection.
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
 * global diff dialog's file switcher. Pure presentation.
 *
 * These are files including files — NOT folders — so every node is rendered as a
 * file row (YML file icon), never a folder, and the include hierarchy is shown
 * by indentation rather than collapsible folders. Read-only cross-ref files show
 * a lock icon whose tooltip names the source (the badge text is too long to sit
 * inline). Disabled nodes (e.g. unchanged files in the diff) are greyed out.
 */
const FileTreeView = ({ rootNode, selectedNodeId, onSelect, isNodeDisabled }: Props) => {
  // Pre-order flatten so the include hierarchy renders as a flat, indented list
  // of files (no collapsible folders). Each entry keeps its depth for indenting
  // and its effective source label (own source, else inherited from the nearest
  // cross-ref ancestor) so read-only children name the ref they were pulled from.
  const flat = useMemo(() => {
    const entries: { node: TreeNode; depth: number; sourceLabel: string | null }[] = [];
    const visit = (node: TreeNode, depth: number, inherited: string | null) => {
      const own = TreeService.sourceLabel(node.source) ?? inherited;
      entries.push({ node, depth, sourceLabel: own });
      node.includes.forEach((child) => visit(child, depth + 1, own));
    };
    rootNode.includes.forEach((child) => visit(child, 0, null));
    return entries;
  }, [rootNode]);

  const metaOf = useMemo(() => {
    const map = new Map<string, { depth: number; sourceLabel: string | null }>();
    flat.forEach(({ node, depth, sourceLabel }) => map.set(node.nodeId, { depth, sourceLabel }));
    return map;
  }, [flat]);

  const collection = useMemo(
    () =>
      createTreeCollection<TreeNode>({
        // Flat collection: the synthetic root holds every node as a direct child,
        // so each renders as a leaf (file) instead of a folder branch.
        rootNode: { ...rootNode, nodeId: SYNTHETIC_ROOT_ID, includes: flat.map((e) => e.node) },
        nodeToValue: (node) => node.nodeId,
        nodeToString: (node) => TreeService.fileName(node.path),
        nodeToChildren: (node) => (node.nodeId === SYNTHETIC_ROOT_ID ? flat.map((e) => e.node) : []),
        isNodeDisabled: (node) => node.nodeId !== SYNTHETIC_ROOT_ID && (isNodeDisabled?.(node) ?? false),
      }),
    [rootNode, flat, isNodeDisabled],
  );

  return (
    <BitkitTreeView
      collection={collection}
      selectionMode="single"
      selectedValue={selectedNodeId ? [selectedNodeId] : []}
      defaultExpandedValue={[SYNTHETIC_ROOT_ID]}
      onSelectionChange={(details) => {
        const nodeId = details.selectedValue[0];
        if (nodeId && nodeId !== SYNTHETIC_ROOT_ID) {
          onSelect(nodeId);
        }
      }}
      render={({ node }) => {
        const label = TreeService.fileName(node.path);
        const meta = metaOf.get(node.nodeId);
        const depth = meta?.depth ?? 0;

        const leaf = (
          <BitkitTreeView.Leaf
            label={label}
            icon={IconFileYml}
            suffixIcon={node.editable ? undefined : IconLock}
            style={{ paddingInlineStart: `${depth * 20}px` }}
          />
        );

        // Read-only files (including path-only includes that inherit a parent's
        // cross-ref) show the source in the lock's tooltip rather than inline (it
        // can be long, e.g. "@some-feature-branch").
        if (!node.editable) {
          const tip = meta?.sourceLabel ? `Read-only — included from ${meta.sourceLabel}` : 'Read-only';
          return <Tooltip label={tip}>{leaf}</Tooltip>;
        }
        return leaf;
      }}
    />
  );
};

export default FileTreeView;
