import { BitkitPageSidebar, rem } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { Text } from '@chakra-ui/react/text';

import { trackWorkflowEditorYmlModuleOpened } from '@/core/analytics/ConfigManagementAnalytics';
import { bitriseYmlStore } from '@/core/stores/BitriseYmlStore';
import { useFileTabs } from '@/hooks/useFileTabs';
import { useSelectedNodeId, useTree } from '@/hooks/useTree';

import FileTreeView from './FileTreeView';

/**
 * The module file tree, rendered in the page sidebar between the navigation and the footer links.
 * Only a modular config (one with `include:`) has a tree, so a single-file config renders nothing.
 */
const FileTreeViewer = ({ showDivider = true }: { showDivider?: boolean }) => {
  const tree = useTree();
  const selectedNodeId = useSelectedNodeId();
  const { openFile } = useFileTabs();

  if (!tree) {
    return null;
  }

  return (
    <>
      {/* Separates the tree from the nav items above it. Full-bleed, unlike the sidebar's default
          inset divider. */}
      {showDivider && (
        <BitkitPageSidebar.Divider marginInline="0" marginBlockStart="0" marginBlockEnd="0" flexShrink={0} />
      )}
      {/* The section title: a Bitkit H4, outside the scroll area so it stays put while the tree
          scrolls. 24px inline padding lines it up with the nav items' left edge. */}
      <Text
        as="h4"
        flexShrink={0}
        paddingInline="24"
        paddingBlockStart="16"
        paddingBlockEnd="8"
        textStyle="heading/h4"
        color="text/primary"
      >
        Configuration modules
      </Text>
      {/* Fills the space between the title and the footer. Scrolls on both axes inside it rather than
          growing the sidebar. Labels never wrap — deep paths scroll sideways instead. Never shorter than
          the group header and 3 modules (32px rows): on short windows the navigation scrolls instead. */}
      <Box
        flex="1 1 0"
        minHeight={rem(128)}
        overflow="auto"
        css={{
          '& *': { whiteSpace: 'nowrap' },
          // Keeps the group header's text on the sidebar's 24px edge, in line with the title.
          '& [data-file-tree-group-header]': { paddingInlineStart: '8' },
        }}
      >
        {/* The tree hangs from the nav's icon column: 16 + the tree's own 8px inset puts the top-level
            icons at 24, under the nav icons, and deeper levels indent from there. Only 8 at the end, so
            long names get more of the sidebar's width. max-content lets the tree be wider than the
            sidebar. */}
        <Box width="max-content" minWidth="full" paddingInlineStart="16" paddingInlineEnd="8" paddingBlockEnd="8">
          <FileTreeView
            rootNode={tree}
            selectedNodeId={selectedNodeId}
            onSelect={(nodeId) => {
              // Only a not-yet-open tab counts as opening a module (re-selecting an open tab doesn't).
              const alreadyOpen = bitriseYmlStore.getState().openTabs.some((tab) => tab.nodeId === nodeId);
              if (!alreadyOpen) {
                trackWorkflowEditorYmlModuleOpened({
                  openMethod: 'file_explorer',
                });
              }
              openFile(nodeId);
            }}
          />
        </Box>
      </Box>
    </>
  );
};

export default FileTreeViewer;
