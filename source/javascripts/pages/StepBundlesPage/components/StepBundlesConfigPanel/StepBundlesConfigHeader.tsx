import { Box, Text } from '@bitrise/bitkit';
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
    <Box display="flex" justifyContent="space-between" padding="24px 24px 16px 24px">
      <Box>
        <Text as="h3" textStyle="heading/h3">
          {parentStepBundleId}
        </Text>
        <Text textStyle="body/sm/regular" color="text/secondary">
          {StepBundleService.getUsedByText(dependants.length)}
        </Text>
      </Box>
    </Box>
  );
};

export default StepBundlesConfigHeader;
