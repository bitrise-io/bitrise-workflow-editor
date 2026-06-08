import { Box, Text } from '@bitrise/bitkit';
import {
  BitkitIconButton,
  BitkitTreeView,
  createTreeCollection,
  IconFileYml,
  IconInfoCircle,
} from '@bitrise/bitkit-v2';
import { useMemo } from 'react';

import { TreeNode } from '@/core/models/Tree';
import FileTreeService, { FileTreeFolder, FileTreeGroup } from '@/core/services/FileTreeService';
import PageProps from '@/core/utils/PageProps';

type Props = {
  /** The real tree root; grouping + folder layout are derived from it. */
  rootNode: TreeNode;
  /** When set, only files matching this predicate are shown (e.g. dirty-only). */
  filter?: (node: TreeNode) => boolean;
  selectedNodeId?: string;
  onSelect: (nodeId: string) => void;
  /** Optional predicate to disable (non-selectable, greyed) individual files. */
  isNodeDisabled?: (node: TreeNode) => boolean;
};

// A single collection node — a synthetic group root, a (possibly collapsed)
// folder, or a file leaf. Folder ids are path strings, file ids are node_ids.
type RenderNode = {
  id: string;
  label: string;
  isFile: boolean;
  node?: TreeNode;
  children: RenderNode[];
};

const GROUP_ROOT_ID = '__group_root__';

function toRenderNode(folder: FileTreeFolder): RenderNode[] {
  const folders = folder.folders.map(
    (child): RenderNode => ({ id: child.id, label: child.label, isFile: false, children: toRenderNode(child) }),
  );
  const files = folder.files.map(
    (file): RenderNode => ({
      id: file.nodeId,
      label: file.fileName,
      isFile: true,
      node: file.node,
      children: [],
    }),
  );
  // Files before folders at every level, matching the design.
  return [...files, ...folders];
}

function collectFolderIds(nodes: RenderNode[], acc: string[]): string[] {
  nodes.forEach((node) => {
    if (!node.isFile) {
      acc.push(node.id);
      collectFolderIds(node.children, acc);
    }
  });
  return acc;
}

const GroupTree = ({
  group,
  selectedNodeId,
  onSelect,
  isNodeDisabled,
}: {
  group: FileTreeGroup;
} & Pick<Props, 'selectedNodeId' | 'onSelect' | 'isNodeDisabled'>) => {
  const children = useMemo(() => toRenderNode(group.root), [group.root]);

  const collection = useMemo(
    () =>
      createTreeCollection<RenderNode>({
        rootNode: { id: GROUP_ROOT_ID, label: '', isFile: false, children },
        nodeToValue: (node) => node.id,
        nodeToString: (node) => node.label,
        nodeToChildren: (node) => node.children,
        isNodeDisabled: (node) => Boolean(node.isFile && node.node && isNodeDisabled?.(node.node)),
      }),
    [children, isNodeDisabled],
  );

  const expandedValue = useMemo(() => [GROUP_ROOT_ID, ...collectFolderIds(children, [])], [children]);

  return (
    <BitkitTreeView
      variant="files"
      collection={collection}
      selectionMode="single"
      selectedValue={selectedNodeId ? [selectedNodeId] : []}
      defaultExpandedValue={expandedValue}
      onSelectionChange={(details) => {
        const id = details.selectedValue[0];
        const selected = id ? collection.findNode(id) : undefined;
        if (selected?.isFile) {
          onSelect(selected.id);
        }
      }}
      render={({ node, nodeState }) =>
        nodeState.isBranch ? (
          <BitkitTreeView.Branch label={node.label} />
        ) : (
          <BitkitTreeView.Leaf label={node.label} icon={IconFileYml} />
        )
      }
    />
  );
};

/**
 * The shared file/folder selector used by the "Open module" popover, the global
 * diff file switcher and the jump-to-definition chooser. Files are grouped by the
 * repository they effectively come from (working repo first), and within a group
 * laid out by their on-disk path with single-child directory chains collapsed.
 * Cross-repo groups carry a read-only info tooltip. Pure presentation — all model
 * shaping lives in `FileTreeService`.
 */
const FileTreeView = ({ rootNode, filter, selectedNodeId, onSelect, isNodeDisabled }: Props) => {
  const projectRepoLabel = PageProps.app()?.gitRepoSlug || PageProps.app()?.name || 'This repository';

  const groups = useMemo(
    () => FileTreeService.buildFileTree(rootNode, { projectRepoLabel, filter }),
    [rootNode, projectRepoLabel, filter],
  );

  return (
    <Box display="flex" flexDirection="column" gap="16">
      {groups.map((group) => (
        <Box key={group.key} display="flex" flexDirection="column">
          {/* No `px` here so the header left-aligns with the title; the tree's own
              8px inset (`--tree-padding-inline-start`) gives the file rows their
              slight indent past the header, matching the design. `py` matches the
              tree rows' vertical padding so the header sits in the same rhythm. */}
          <Box display="flex" alignItems="center" gap="4" py="6">
            <Text textStyle="body/md/semibold">{group.header}</Text>
            {group.isReadOnly && (
              <BitkitIconButton
                size="sm"
                variant="tertiary"
                label="Modules included from another repository or ref are read-only."
                icon={IconInfoCircle}
              />
            )}
          </Box>
          <GroupTree
            group={group}
            selectedNodeId={selectedNodeId}
            onSelect={onSelect}
            isNodeDisabled={isNodeDisabled}
          />
        </Box>
      ))}
    </Box>
  );
};

export default FileTreeView;
