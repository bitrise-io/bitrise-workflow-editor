import { BitkitPageSidebar, rem } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';

import { trackWorkflowEditorYmlModuleOpened } from '@/core/analytics/ConfigManagementAnalytics';
import { bitriseYmlStore } from '@/core/stores/BitriseYmlStore';
import { useFileTabs } from '@/hooks/useFileTabs';
import { useSelectedNodeId, useTree } from '@/hooks/useTree';

import FileTreeView from './FileTreeView';

const FileTreeViewer = ({ withDivider = true }: { withDivider?: boolean }) => {
  const tree = useTree();
  const selectedNodeId = useSelectedNodeId();
  const { openFile } = useFileTabs();

  if (!tree) {
    return null;
  }

  return (
    // The tree never gets shorter than its group header + 3 modules (128), on top of the 1px rule and
    // the 48px title: on short windows the navigation scrolls instead.
    <BitkitPageSidebar.Section minHeight={rem(177)} title="Configuration modules" withDivider={withDivider}>
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
    </BitkitPageSidebar.Section>
  );
};

export default FileTreeViewer;
