import { Box } from '@bitrise/bitkit';

import RuntimeUtils from '@/core/utils/RuntimeUtils';
import { useTree } from '@/hooks/useTree';
import OptimizeYouCiConfigBySplittingNotification from '@/pages/YmlPage/components/OptimizeYouCiConfigBySplittingNotification'; // TODO: implement onConfigSourceChangeSaved function
import YourCiConfigIsSplitNotification from '@/pages/YmlPage/components/YourCiConfigIsSplitNotification';

import ModularYmlEditor from './components/ModularYmlEditor';
import YmlEditor from './components/YmlEditor';

const YmlPage = () => {
  const isWebsiteMode = RuntimeUtils.isWebsiteMode();
  const isModular = Boolean(useTree());

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <Box flexGrow="1" flexShrink="1" paddingBlock="12" backgroundColor="#1e1e1e" position="relative">
        {isWebsiteMode && !isModular && <YourCiConfigIsSplitNotification />}
        {isWebsiteMode && !isModular && <OptimizeYouCiConfigBySplittingNotification />}
        {isModular ? <ModularYmlEditor /> : <YmlEditor />}
      </Box>
    </Box>
  );
};

export default YmlPage;
