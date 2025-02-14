import { Text } from '@bitrise/bitkit';
import useDependantWorkflows from '@/hooks/useDependantWorkflows';
import StepBundleService from '@/core/models/StepBundleService';
import { useStepBundleConfigContext } from './StepBundlesConfig.context';

const StepBundlesConfigHeader = () => {
  const { cvs, id, userValues } = useStepBundleConfigContext() ?? {};

  const dependants = useDependantWorkflows({ stepBundleCvs: cvs });

  return (
    <>
      <Text as="h3" textStyle="heading/h3">
        {userValues?.title || id || 'Step bundle'}
      </Text>
      <Text textStyle="body/sm/regular" color="text/secondary">
        {StepBundleService.getUsedByText(dependants.length)}
      </Text>
    </>
  );
};

export default StepBundlesConfigHeader;
