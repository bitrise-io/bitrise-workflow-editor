import { Box, Text } from '@bitrise/bitkit';
import { BitkitCloseButton, BitkitIconButton, IconFolder } from '@bitrise/bitkit-v2';
import { Popover } from '@chakra-ui/react/popover';
import { Portal } from '@chakra-ui/react/portal';
import { useState } from 'react';

import { useTabs } from '@/hooks/useTabs';
import { useSelectedNodeId, useTree } from '@/hooks/useTree';
import CreateFileButton from '@/pages/YmlPage/components/OpenFileTabs/CreateFileButton';

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
      positioning={{ placement: 'bottom-end', gutter: 4 }}
    >
      {/* Position against an explicit `Popover.Anchor` element rather than the
          trigger's ref. The trigger ref has to thread through BitkitIconButton's
          `asChild` → IconButton → BitkitLabelTooltip wrapper, and when that chain
          drops the ref the popper can't find its reference and renders at the
          window's top-left. The Anchor is a plain wrapper div around the button,
          so positioning is robust regardless of the inner ref plumbing.

          Inside it we keep BitkitIconButton's `asChild` so `Popover.Trigger`
          becomes the real button *within* the label tooltip (clicking toggles
          open). Wrapping the other way (`Popover.Trigger asChild` around
          BitkitIconButton) would clone the trigger onto the tooltip root and
          break the tooltip's own anchoring. */}
      <Popover.Anchor display="inline-flex">
        <BitkitIconButton asChild label="Open module" variant="secondary" size="sm" icon={IconFolder}>
          <Popover.Trigger />
        </BitkitIconButton>
      </Popover.Anchor>
      <Portal>
        {/* The z-index MUST live on Popover.Content, not the Positioner. Zag
            (chakra v3's popover engine) hard-codes the positioner's inline
            style to `z-index: var(--z-index)` and computes `--z-index` from the
            *content's* computed z-index (see @zag-js/popper get-placement.js) —
            so a z-index set on the Positioner is overridden by that inline
            `var(--z-index)` and ignored. Pin a concrete value on Content
            (bitkit-v2's `defaultBaseConfig` system ships no `zIndices` tokens,
            so a `"popover"` token wouldn't resolve either); the positioner then
            inherits it and sits above positioned canvas chrome like the
            Pipelines toolbar (a transform-rooted stacking context at zIndex 10). */}
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
            {/* Fixed header — title + close stay put while the tree below scrolls. */}
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
              <Box display="flex" alignItems="center" gap="8">
                <CreateFileButton />
                {/* Close via the controlled state rather than `Popover.CloseTrigger
                    asChild` — wrapping BitkitCloseButton's tooltip element with the
                    trigger breaks the label tooltip's anchoring (it renders at the
                    window's top-left). Esc / outside-click still close via onOpenChange. */}
                <BitkitCloseButton size="sm" aria-label="Close" onClick={() => setIsOpen(false)} />
              </Box>
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
