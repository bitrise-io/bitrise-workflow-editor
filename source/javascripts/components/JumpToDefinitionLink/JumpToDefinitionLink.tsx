import { Link } from '@bitrise/bitkit';
import { Popover } from '@chakra-ui/react/popover';
import { Portal } from '@chakra-ui/react/portal';
import { ReactElement, ReactNode, useCallback, useMemo, useState } from 'react';

import FileTreeView from '@/components/FileTreeViewer/FileTreeView';
import { EntityKind, TreeNode } from '@/core/models/Tree';
import EntityIndexService from '@/core/services/EntityIndexService';
import { useEntityIndex } from '@/hooks/useEntityIndex';
import useJumpToDefinition from '@/hooks/useJumpToDefinition';
import { useTree } from '@/hooks/useTree';

type Props = {
  kind: EntityKind;
  id: string;
  children?: ReactNode;
  trigger?: ReactElement<{ onClick?: () => void }>;
  onOpenChange?: (isOpen: boolean) => void;
};

const JumpToDefinitionLink = ({ kind, id, children, trigger, onOpenChange }: Props) => {
  const tree = useTree();
  const entityIndex = useEntityIndex();
  const jumpToDefinition = useJumpToDefinition();
  const [isOpen, setIsOpen] = useState(false);

  const definitionIds = useMemo(
    () => new Set(EntityIndexService.definitionsOf(entityIndex, kind, id).map((def) => def.nodeId)),
    [entityIndex, kind, id],
  );

  // Stable identities: a new closure rebuilds FileTreeView's collection and resets its expansion state.
  const filterToDefinitions = useCallback((node: TreeNode) => definitionIds.has(node.nodeId), [definitionIds]);
  const handleSelect = useCallback(
    (nodeId: string) => {
      jumpToDefinition(kind, id, nodeId);
      setIsOpen(false);
      // Closing via the controlled prop doesn't fire Popover.onOpenChange, so notify callers
      // tracking open state (e.g. a card's isJumpPopoverOpen) ourselves.
      onOpenChange?.(false);
    },
    [jumpToDefinition, kind, id, onOpenChange],
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
      <Popover.Trigger asChild>
        {trigger ?? (
          <Link as="button" colorScheme="purple">
            {children}
          </Link>
        )}
      </Popover.Trigger>
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
              {tree && <FileTreeView rootNode={tree} filter={filterToDefinitions} onSelect={handleSelect} />}
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
};

export default JumpToDefinitionLink;
