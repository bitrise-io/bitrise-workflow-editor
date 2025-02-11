import { Box, Text } from '@bitrise/bitkit';
import useDependantWorkflows from '@/hooks/useDependantWorkflows';
import StepBundleService from '@/core/models/StepBundleService';

type Props = {
  id: string;
};

const StepBundlesConfigHeader = ({ id }: Props) => {
  const dependants = useDependantWorkflows({ stepBundleCvs: `bundle::${id}` });

  return (
    <Box padding="24px 24px 16px 24px">
      <Text as="h3" textStyle="heading/h3">
        {id || 'Step bundle'}
      </Text>
      <Text textStyle="body/sm/regular" color="text/secondary">
        {StepBundleService.getUsedByText(dependants.length)}
      </Text>
    </Box>
  );
};

export default StepBundlesConfigHeader;
