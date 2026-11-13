import { BitkitTooltip, BitkitTreeView, createTreeCollection, IconFileYml, IconInfoCircle } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { Text } from '@chakra-ui/react/text';
import { useId, useMemo, useState } from 'react';

import { TreeNode } from '@/core/models/Tree';
import FileTreeService, { FileTreeFolder, FileTreeGroup } from '@/core/services/FileTreeService';
import PageProps from '@/core/utils/PageProps';

type Props = {
  rootNode: TreeNode;
  selectedNodeId?: string;
  onSelect: (nodeId: string) => void;
};

// Folder ids are path strings, file ids are node_ids.
type RenderNode = {
  id: string;
  label: string;
  isFile: boolean;
  children: RenderNode[];
};

const GROUP_ROOT_ID = '__group_root__';

function toRenderNode(folder: FileTreeFolder): RenderNode[] {
  const folders = folder.folders.map((child): RenderNode => ({
    id: child.id,
    label: child.label,
    isFile: false,
    children: toRenderNode(child),
  }));
  const files = folder.files.map((file): RenderNode => ({
    id: file.nodeId,
    label: file.fileName,
    isFile: true,
    children: [],
  }));
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
  labelId,
  selectedNodeId,
  onSelect,
}: {
  group: FileTreeGroup;
  labelId: string;
} & Pick<Props, 'selectedNodeId' | 'onSelect'>) => {
  const children = useMemo(() => toRenderNode(group.root), [group.root]);

  const collection = useMemo(
    () =>
      createTreeCollection<RenderNode>({
        rootNode: { id: GROUP_ROOT_ID, label: '', isFile: false, children },
        nodeToValue: (node) => node.id,
        nodeToString: (node) => node.label,
        nodeToChildren: (node) => node.children,
      }),
    [children],
  );

  const folderIds = useMemo(() => collectFolderIds(children, []), [children]);

  // The tree stays mounted while the config changes, so it tracks the folders the user closed rather
  // than the open ones: a folder added by a save or a reload starts open, like the rest.
  const [collapsedIds, setCollapsedIds] = useState<ReadonlySet<string>>(() => new Set());
  const expandedValue = useMemo(
    () => [GROUP_ROOT_ID, ...folderIds.filter((id) => !collapsedIds.has(id))],
    [folderIds, collapsedIds],
  );

  // A module opened from a tab or a jump-to-definition gets its folders opened, once per selection.
  const [revealedNodeId, setRevealedNodeId] = useState(selectedNodeId);
  if (selectedNodeId !== revealedNodeId) {
    setRevealedNodeId(selectedNodeId);
    const parentIds = selectedNodeId ? collection.getParentNodes(selectedNodeId).map((node) => node.id) : [];
    if (parentIds.some((id) => collapsedIds.has(id))) {
      setCollapsedIds((prev) => new Set([...prev].filter((id) => !parentIds.includes(id))));
    }
  }

  return (
    <BitkitTreeView
      ids={{ label: labelId }}
      variant="files"
      collection={collection}
      selectionMode="single"
      selectedValue={selectedNodeId ? [selectedNodeId] : []}
      expandedValue={expandedValue}
      onExpandedChange={(details) => {
        setCollapsedIds(new Set(folderIds.filter((id) => !details.expandedValue.includes(id))));
      }}
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

const FileTreeView = ({ rootNode, selectedNodeId, onSelect }: Props) => {
  const idPrefix = useId();
  const projectRepoLabel = PageProps.app()?.gitRepoSlug || PageProps.app()?.name || 'This repository';

  const groups = useMemo(
    () => FileTreeService.buildFileTree(rootNode, { projectRepoLabel }),
    [rootNode, projectRepoLabel],
  );

  return (
    <Box display="flex" flexDirection="column" gap="16">
      {groups.map((group, index) => (
        <Box key={group.key} display="flex" flexDirection="column">
          <Box display="flex" alignItems="center" gap="4" paddingBlock="6" paddingInlineStart="8">
            <Text id={`${idPrefix}-${index}`} textStyle="body/md/semibold">
              {group.header}
            </Text>
            {group.isReadOnly && (
              <BitkitTooltip text="Modules included from another repository or ref are read-only.">
                {/* Focusable + labelled so the read-only explanation is reachable by keyboard and
                    announced by screen readers, while staying non-actionable (not a button). */}
                <IconInfoCircle
                  size="16"
                  color="icon/tertiary"
                  tabIndex={0}
                  role="img"
                  aria-label="Read-only — included from another repository or ref"
                />
              </BitkitTooltip>
            )}
          </Box>
          <GroupTree
            group={group}
            labelId={`${idPrefix}-${index}`}
            selectedNodeId={selectedNodeId}
            onSelect={onSelect}
          />
        </Box>
      ))}
    </Box>
  );
};

export default FileTreeView;
