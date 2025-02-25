import { Box, Tab, TabList, Text } from '@bitrise/bitkit';
import useDependantWorkflows from '@/hooks/useDependantWorkflows';
import StepBundleService from '@/core/services/StepBundleService';
import { useStepBundleConfigContext } from './StepBundlesConfig.context';

const StepBundlesConfigHeader = () => {
  const { cvs, id, userValues } = useStepBundleConfigContext() ?? {};

  const dependants = useDependantWorkflows({ stepBundleCvs: cvs });

  return (
    <>
      <Box padding="24">
        <Text as="h3" textStyle="heading/h3">
          {userValues?.title || id || 'Step bundle'}
        </Text>
        <Text textStyle="body/sm/regular" color="text/secondary">
          {StepBundleService.getUsedByText(dependants.length)}
        </Text>
      </Box>
      <TabList paddingX="8">
        <Tab>Configuration</Tab>
        <Tab>Properties</Tab>
      </TabList>
    </>
  );
};

export default StepBundlesConfigHeader;
