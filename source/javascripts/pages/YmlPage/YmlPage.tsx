import { Box } from '@bitrise/bitkit';

import RuntimeUtils from '@/core/utils/RuntimeUtils';
import OptimizeYouCiConfigBySplittingNotification from '@/pages/YmlPage/components/OptimizeYouCiConfigBySplittingNotification'; // TODO: implement onConfigSourceChangeSaved function
import YourCiConfigIsSplitNotification from '@/pages/YmlPage/components/YourCiConfigIsSplitNotification';

import YmlEditor from './components/YmlEditor';
import YmlEditorHeader from './components/YmlEditorHeader';

// TODO: implement onConfigSourceChangeSaved function
const YmlPage = () => {
  const isWebsiteMode = RuntimeUtils.isWebsiteMode();

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <YmlEditorHeader />
      <Box flexGrow="1" flexShrink="1" paddingBlock="12" backgroundColor="#1e1e1e" position="relative">
        {isWebsiteMode && <YourCiConfigIsSplitNotification />}
        {isWebsiteMode && <OptimizeYouCiConfigBySplittingNotification />}
        <YmlEditor />
      </Box>
    </Box>
  );
};

export default YmlPage;
