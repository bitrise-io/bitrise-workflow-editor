import { Link } from '@bitrise/bitkit';
import { Popover } from '@chakra-ui/react/popover';
import { Portal } from '@chakra-ui/react/portal';
import { cloneElement, ReactElement, ReactNode, useMemo, useState } from 'react';

import FileTreeView from '@/components/FileTreeViewer/FileTreeView';
import { EntityKind } from '@/core/models/Tree';
import EntityIndexService from '@/core/services/EntityIndexService';
import { useEntityIndex } from '@/hooks/useEntityIndex';
import useJumpToDefinition from '@/hooks/useJumpToDefinition';
import { useTree } from '@/hooks/useTree';

type Props = {
  kind: EntityKind;
  id: string;
  /** Default trigger content, rendered inside a purple text Link. */
  children?: ReactNode;
  /** Custom trigger element (cloned for a single def, used as popover trigger for multiple). Takes precedence over `children`. */
  trigger?: ReactElement<{ onClick?: () => void }>;
};

/**
 * The "Edit / Go to definition" link in a cross-file drawer header. A single definition
 * jumps straight to it; an entity with multiple definitions (override, or same path from
 * different refs) opens a chooser so the user picks which layer to open.
 */
const JumpToDefinitionLink = ({ kind, id, children, trigger }: Props) => {
  const tree = useTree();
  const entityIndex = useEntityIndex();
  const jumpToDefinition = useJumpToDefinition();
  const [isOpen, setIsOpen] = useState(false);

  const definitionIds = useMemo(
    () => new Set(EntityIndexService.definitionsOf(entityIndex, kind, id).map((def) => def.nodeId)),
    [entityIndex, kind, id],
  );

  if (definitionIds.size <= 1) {
    if (trigger) {
      return cloneElement(trigger, { onClick: () => jumpToDefinition(kind, id) });
    }
    return (
      <Link as="button" colorScheme="purple" onClick={() => jumpToDefinition(kind, id)}>
        {children}
      </Link>
    );
  }

  return (
    <Popover.Root
      open={isOpen}
      onOpenChange={(details) => setIsOpen(details.open)}
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
              {tree && (
                <FileTreeView
                  rootNode={tree}
                  filter={(node) => definitionIds.has(node.nodeId)}
                  onSelect={(nodeId) => {
                    jumpToDefinition(kind, id, nodeId);
                    setIsOpen(false);
                  }}
                />
              )}
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
};

export default JumpToDefinitionLink;
