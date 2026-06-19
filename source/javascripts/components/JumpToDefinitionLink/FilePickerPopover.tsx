import { Popover } from '@chakra-ui/react/popover';
import { Portal } from '@chakra-ui/react/portal';
import { ReactElement, useCallback, useMemo, useState } from 'react';

import FileTreeView from '@/components/FileTreeViewer/FileTreeView';
import { TreeNode } from '@/core/models/Tree';

type Props = {
  rootNode: TreeNode;
  /** node_ids the picker is restricted to (the files that define the target). */
  nodeIds: string[];
  onSelect: (nodeId: string) => void;
  trigger: ReactElement<{ onClick?: () => void }>;
  onOpenChange?: (isOpen: boolean) => void;
};

/**
 * A file-tree picker in a popover, restricted to an explicit set of nodes. The index-driven counterpart
 * is {@link JumpToDefinitionLink}; this variant takes the node set + action directly, for targets that
 * aren't in the entity index (e.g. the root `meta` default stack singleton).
 */
const FilePickerPopover = ({ rootNode, nodeIds, onSelect, trigger, onOpenChange }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const ids = useMemo(() => new Set(nodeIds), [nodeIds]);

  const filter = useCallback((node: TreeNode) => ids.has(node.nodeId), [ids]);
  const handleSelect = useCallback(
    (nodeId: string) => {
      onSelect(nodeId);
      setIsOpen(false);
      onOpenChange?.(false);
    },
    [onSelect, onOpenChange],
  );

  return (
    <Popover.Root
      open={isOpen}
      onOpenChange={(details) => {
        setIsOpen(details.open);
        onOpenChange?.(details.open);
      }}
      positioning={{ placement: 'bottom-start' }}
    >
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Portal>
        {/* z-index on Content, not Positioner — see FileTreeViewer for why. */}
        <Popover.Positioner>
          <Popover.Content
            zIndex={1500}
            width="320px"
            maxWidth="320px"
            backgroundColor="background/primary"
            border="1px solid"
            borderColor="border/regular"
            borderRadius="8"
            boxShadow="large"
          >
            <Popover.Body p="8" maxHeight="50vh" overflowY="auto">
              <FileTreeView rootNode={rootNode} filter={filter} onSelect={handleSelect} />
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
};

export default FilePickerPopover;
