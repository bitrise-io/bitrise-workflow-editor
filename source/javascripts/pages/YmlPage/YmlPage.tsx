import { Box, Text } from '@bitrise/bitkit';

import YmlValidationBadge from '@/components/YmlValidationBadge';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import useYmlValidationStatus from '@/hooks/useYmlValidationStatus';
import OptimizeYouCiConfigBySplittingNotification from '@/pages/YmlPage/components/OptimizeYouCiConfigBySplittingNotification'; // TODO: implement onConfigSourceChangeSaved function
import YourCiConfigIsSplitNotification from '@/pages/YmlPage/components/YourCiConfigIsSplitNotification';

import YmlEditor from './components/YmlEditor';

const YmlPage = () => {
  const isWebsiteMode = RuntimeUtils.isWebsiteMode();
  const ymlStatus = useYmlValidationStatus();

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <Box display="flex" flexDirection={['column', 'row']} gap="16" alignItems={['flex-start', 'center']} p="32">
        <Text as="h2" textStyle="heading/h2">
          Configuration YAML
        </Text>
        <Box marginInlineEnd="auto">
          <YmlValidationBadge status={ymlStatus} />
        </Box>
      </Box>
      <Box flexGrow="1" flexShrink="1" paddingBlock="12" backgroundColor="#1e1e1e" position="relative">
        {isWebsiteMode && <YourCiConfigIsSplitNotification />}
        {isWebsiteMode && <OptimizeYouCiConfigBySplittingNotification />}
        <YmlEditor />
      </Box>
    </Box>
  );
};

export default YmlPage;
