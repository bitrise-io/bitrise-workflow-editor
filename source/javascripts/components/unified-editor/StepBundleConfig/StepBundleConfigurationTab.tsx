import { Box } from '@bitrise/bitkit';

import WhenToRunCard from '../WhenTorunCard/WhenTorunCard';
import { useStepBundleConfigContext } from './StepBundleConfig.context';
import StepBundleConfigInputs from './StepBundleConfigInputs';

const StepBundleConfigurationTab = () => {
  const context = useStepBundleConfigContext();
  console.log(context);
  return (
    <Box display="flex" flexDir="column" gap="12">
      <WhenToRunCard
        defaultValuesRunIf="eee"
        isAlwaysRun
        onIsAlwaysRunChange={() => {}}
        onRunIfChange={() => {}}
        userValuesRunIf=""
      />
      <StepBundleConfigInputs />
    </Box>
  );
};

export default StepBundleConfigurationTab;
