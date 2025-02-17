import { Box, Text } from '@bitrise/bitkit';
import useDependantWorkflows from '@/hooks/useDependantWorkflows';
import StepBundleService from '@/core/services/StepBundleService';

type Props = {
  parentStepBundleId: string;
};

const StepBundlesConfigHeader = ({ parentStepBundleId }: Props) => {
  const dependants = useDependantWorkflows({ stepBundleCvs: `bundle::${parentStepBundleId}` });

  return (
    <Box padding="24px 24px 16px 24px">
      <Text as="h3" textStyle="heading/h3">
        {parentStepBundleId || 'Step bundle'}
      </Text>
      <Text textStyle="body/sm/regular" color="text/secondary">
        {StepBundleService.getUsedByText(dependants.length)}
      </Text>
    </Box>
  );
};

export default StepBundlesConfigHeader;
