import { BitkitPageSidebar, rem } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { Text } from '@chakra-ui/react/text';

import { trackWorkflowEditorYmlModuleOpened } from '@/core/analytics/ConfigManagementAnalytics';
import { bitriseYmlStore } from '@/core/stores/BitriseYmlStore';
import { useFileTabs } from '@/hooks/useFileTabs';
import { useSelectedNodeId, useTree } from '@/hooks/useTree';

import FileTreeView from './FileTreeView';

const FileTreeViewer = ({ showDivider = true }: { showDivider?: boolean }) => {
  const tree = useTree();
  const selectedNodeId = useSelectedNodeId();
  const { openFile } = useFileTabs();

  if (!tree) {
    return null;
  }

  return (
    <>
      {showDivider && (
        <BitkitPageSidebar.Divider marginInline="0" marginBlockStart="0" marginBlockEnd="0" flexShrink={0} />
      )}
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
      {/* Never shorter than the group header + 3 modules: on short windows the navigation scrolls instead. */}
      <Box flex="1 1 0" minHeight={rem(128)} overflow="auto">
        {/* 16 + the tree's own 8px inset puts the top-level icons under the nav icons. */}
        <Box width="max-content" minWidth="full" paddingInlineStart="16" paddingInlineEnd="8" paddingBlockEnd="8">
          <FileTreeView
            rootNode={tree}
            selectedNodeId={selectedNodeId}
            onSelect={(nodeId) => {
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
