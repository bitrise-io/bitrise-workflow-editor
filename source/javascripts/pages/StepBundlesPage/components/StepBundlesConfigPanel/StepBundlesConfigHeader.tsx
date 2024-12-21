import { Box, Tab, TabList, Text } from '@bitrise/bitkit';
import useDependantWorkflows from '@/hooks/useDependantWorkflows';
import { useWorkflowConfigContext } from '@/components/unified-editor/WorkflowConfig/WorkflowConfig.context';
import StepBundleService from '@/core/models/StepBundleService';

type Props = {
  parentStepBundleId: string;
};

const StepBundlesConfigHeader = ({ parentStepBundleId }: Props) => {
  const { id = '' } = useWorkflowConfigContext() ?? {};
  const dependants = useDependantWorkflows({ workflowId: id });

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" px={24} py={16}>
        <Box>
          <Text as="h3" textStyle="heading/h3">
            {parentStepBundleId}
          </Text>
          <Text textStyle="body/sm/regular" color="text/secondary">
            {StepBundleService.getUsedByText(dependants.length)}
          </Text>
        </Box>
      </Box>
      <Box mt="16">
        <TabList position="relative" paddingX="8">
          <Tab>Configuration</Tab>
          <Tab>Properties</Tab>
        </TabList>
      </Box>
    </>
  );
};

export default StepBundlesConfigHeader;
