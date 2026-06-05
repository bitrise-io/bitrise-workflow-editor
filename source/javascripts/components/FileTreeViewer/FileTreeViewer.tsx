import { BitkitIconButton, IconFolder } from '@bitrise/bitkit-v2';
import { Popover } from '@chakra-ui/react/popover';
import { Portal } from '@chakra-ui/react/portal';
import { useState } from 'react';

import { TreeNode } from '@/core/models/Tree';
import { useTabs } from '@/hooks/useTabs';
import { useSelectedNodeId, useTree } from '@/hooks/useTree';

import FileTreeView, { SYNTHETIC_ROOT_ID } from './FileTreeView';

function syntheticRoot(root: TreeNode): TreeNode {
  // Wrap the real root in a hidden synthetic node so `bitrise.yml` stays visible
  // as the top-level entry (the tree-view renders the root's children).
  return {
    nodeId: SYNTHETIC_ROOT_ID,
    path: '',
    contents: '',
    source: null,
    commitSha: '',
    editable: true,
    includes: [root],
  };
}

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
      positioning={{ placement: 'bottom-end' }}
    >
      <Popover.Trigger asChild>
        <BitkitIconButton label="Open module" variant="secondary" size="sm" icon={IconFolder} />
      </Popover.Trigger>
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
            backgroundColor="background/primary"
            border="1px solid"
            borderColor="border/regular"
            borderRadius="8"
            boxShadow="large"
          >
            <Popover.Body p="8" maxHeight="50vh" overflowY="auto">
              <FileTreeView
                rootNode={syntheticRoot(tree)}
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
