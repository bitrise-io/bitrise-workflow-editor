import { Box } from '@chakra-ui/react/box';

import FileTreeView from '@/components/FileTreeViewer/FileTreeView';
import { useFileTabs } from '@/hooks/useFileTabs';
import { useIsMergedConfigSelected, useSelectedNodeId, useTree } from '@/hooks/useTree';

// The merged config lives only on the tab line, as its first tab: it is a view, not a file.
const FilesPanel = () => {
  const tree = useTree();
  const selectedNodeId = useSelectedNodeId();
  const isMergedConfigSelected = useIsMergedConfigSelected();
  const { openFile } = useFileTabs();

  if (!tree) {
    return null;
  }

  return (
    // File paths are the customer's repository layout: keep them out of session recordings.
    <Box data-clarity-mask="true">
      <FileTreeView
        rootNode={tree}
        selectedNodeId={isMergedConfigSelected ? undefined : selectedNodeId}
        onSelect={openFile}
      />
    </Box>
  );
};

export default FilesPanel;
