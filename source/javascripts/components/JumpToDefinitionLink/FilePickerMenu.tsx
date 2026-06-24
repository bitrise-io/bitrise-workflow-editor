import { BitkitActionMenu, IconFileYml } from '@bitrise/bitkit-v2';
import { ReactElement, useMemo } from 'react';

import { TreeNode } from '@/core/models/Tree';
import FileTreeService from '@/core/services/FileTreeService';
import PageProps from '@/core/utils/PageProps';

type Props = {
  rootNode: TreeNode;
  /** node_ids the menu lists, in display order (e.g. definitions highest-precedence-first). */
  nodeIds: string[];
  onSelect: (nodeId: string) => void;
  trigger: ReactElement<{ onClick?: () => void }>;
  onOpenChange?: (isOpen: boolean) => void;
};

/**
 * A menu listing files (one item per `nodeId`, labelled by file name and cross-repo origin) that
 * jumps to the picked file. The index-driven counterpart is {@link JumpToDefinitionLink}; this
 * variant takes the node set + action directly, for targets that aren't in the entity index.
 */
const FilePickerMenu = ({ rootNode, nodeIds, onSelect, trigger, onOpenChange }: Props) => {
  const projectRepoLabel = PageProps.app()?.gitRepoSlug || PageProps.app()?.name || 'This repository';

  const items = useMemo(() => {
    const filesByNodeId = FileTreeService.describeFiles(rootNode, projectRepoLabel);
    return nodeIds.flatMap((nodeId) => {
      const file = filesByNodeId.get(nodeId);
      if (!file) {
        return [];
      }
      const label = file.repoLabel ? `${file.fileName} in ${file.repoLabel}` : file.fileName;
      return [{ nodeId, label }];
    });
  }, [rootNode, projectRepoLabel, nodeIds]);

  return (
    <BitkitActionMenu.Root
      trigger={trigger}
      positioning={{ placement: 'bottom-start' }}
      onSelect={({ value }) => onSelect(value)}
      onOpenChange={onOpenChange ? ({ open }) => onOpenChange(open) : undefined}
    >
      {items.map((item) => (
        <BitkitActionMenu.Item key={item.nodeId} value={item.nodeId} icon={IconFileYml}>
          {item.label}
        </BitkitActionMenu.Item>
      ))}
    </BitkitActionMenu.Root>
  );
};

export default FilePickerMenu;
