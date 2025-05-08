import { Box } from '@bitrise/bitkit';

import RuntimeUtils from '@/core/utils/RuntimeUtils';
import useFeatureFlag from '@/hooks/useFeatureFlag';
import OptimizeYouCiConfigBySplittingNotification from '@/pages/YmlPage/components/OptimizeYouCiConfigBySplittingNotification'; // TODO: implement onConfigSourceChangeSaved function
import YourCiConfigIsSplitNotification from '@/pages/YmlPage/components/YourCiConfigIsSplitNotification';

import YmlEditorHeader from './components/YmlEditorHeader';
// import YmlEditor from './components/YmlEditor';
import YmlLSPEditor from './components/YmlLSPEditor';

// TODO: implement onConfigSourceChangeSaved function
const YmlPage = () => {
  const isWebsiteMode = RuntimeUtils.isWebsiteMode();
  const useLSP = useFeatureFlag('enable-wfe-editor-language-server');

  if (useLSP) {
    return (
      <Box height="100%" display="flex" flexDirection="column">
        <YmlEditorHeader />
        <Box flexGrow="1" flexShrink="1" paddingBlock="12" backgroundColor="#1e1e1e" position="relative">
          {isWebsiteMode && <YourCiConfigIsSplitNotification />}
          {isWebsiteMode && <OptimizeYouCiConfigBySplittingNotification />}
          <YmlLSPEditor />
        </Box>
      </Box>
    );
  }

  // return (
  //   <Box height="100%" display="flex" flexDirection="column">
  //     <YmlEditorHeader />
  //     <Box flexGrow="1" flexShrink="1" paddingBlock="12" backgroundColor="#1e1e1e" position="relative">
  //       {isWebsiteMode && <YourCiConfigIsSplitNotification />}
  //       {isWebsiteMode && <OptimizeYouCiConfigBySplittingNotification />}
  //       <YmlEditor />
  //     </Box>
  //   </Box>
  // );
};

export default YmlPage;
