import { Box, Text } from '@bitrise/bitkit';
import { BitkitCloseButton, BitkitIconButton, IconPlus } from '@bitrise/bitkit-v2';
import { Popover } from '@chakra-ui/react/popover';
import { Portal } from '@chakra-ui/react/portal';
import { useState } from 'react';

import { useTabs } from '@/hooks/useTabs';
import { useSelectedNodeId, useTree } from '@/hooks/useTree';

import FileTreeView from './FileTreeView';

const FileTreeViewer = () => {
  const tree = useTree();
  const selectedNodeId = useSelectedNodeId();
  const { openFile } = useTabs();
  const [isOpen, setIsOpen] = useState(false);

  if (!tree) {
    return null;
  }

  return (
    <Popover.Root
      open={isOpen}
      onOpenChange={(details) => setIsOpen(details.open)}
      positioning={{ placement: 'bottom-start', gutter: 4 }}
    >
      <Popover.Trigger asChild>
        <BitkitIconButton label="Open module" variant="tertiary" size="sm" icon={IconPlus} color="icon/primary" />
      </Popover.Trigger>
      <Portal>
        {/* z-index MUST be on Popover.Content, not Positioner: Zag derives the positioner's
            inline `z-index: var(--z-index)` from Content's computed z-index, so a value set
            on Positioner is ignored. Use a concrete number (no `zIndices` tokens in bitkit-v2). */}
        <Popover.Positioner>
          <Popover.Content
            zIndex={1500}
            width="360px"
            maxWidth="360px"
            maxHeight="60vh"
            display="flex"
            flexDirection="column"
            overflow="hidden"
            backgroundColor="background/primary"
            border="1px solid"
            borderColor="border/regular"
            borderRadius="12px"
            boxShadow="0 2px 24px 0 rgba(0, 0, 0, 0.08)"
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              gap="16"
              px="24"
              pt="24"
              pb="16"
              flexShrink={0}
            >
              <Text textStyle="heading/h3" as="h2">
                Open module
              </Text>
              <Popover.CloseTrigger asChild>
                <BitkitCloseButton size="sm" aria-label="Close" />
              </Popover.CloseTrigger>
            </Box>
            <Popover.Body px="24" pt="0" pb="24" flex="1" minHeight="0" overflowY="auto">
              <FileTreeView
                rootNode={tree}
                selectedNodeId={selectedNodeId}
                onSelect={(nodeId) => {
                  openFile(nodeId);
                  setIsOpen(false);
                }}
              />
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
};

export default FileTreeViewer;
