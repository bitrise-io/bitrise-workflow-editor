import { Box } from '@bitrise/bitkit';
import { ChangeEventHandler } from 'react';

import StepBundleService from '@/core/services/StepBundleService';

import WhenToRunCard from '../WhenTorunCard/WhenTorunCard';
import { useStepBundleConfigContext } from './StepBundleConfig.context';
import StepBundleConfigInputs from './StepBundleConfigInputs';

const StepBundleConfigurationTab = () => {
  const { stepBundle, stepBundleId, parentStepBundleId, parentWorkflowId } = useStepBundleConfigContext();

  const defaultValues = stepBundle?.defaultValues ?? {};
  const userValues = stepBundle?.userValues ?? {};
  const mergedValues = stepBundle?.mergedValues ?? {};

  const isDefaultMode = !parentStepBundleId && !parentWorkflowId;

  const onIsAlwaysRunChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (stepBundleId) {
      if (isDefaultMode) {
        StepBundleService.updateStepBundleField(stepBundleId, 'is_always_run', e.currentTarget.checked);
      }
    }
  };

  const onIsAlwaysRunReset = () => {
    if (stepBundleId) {
      StepBundleService.updateStepBundleField(stepBundleId, 'is_always_run', undefined);
    }
  };

  const onRunIfChange = (runIf: string) => {
    if (stepBundleId) {
      StepBundleService.updateStepBundleField(stepBundleId, 'run_if', runIf);
    }
  };

  return (
    <Box display="flex" flexDir="column" gap="12">
      <WhenToRunCard
        defaultValuesRunIf={isDefaultMode ? undefined : defaultValues.run_if}
        isAlwaysRun={mergedValues.is_always_run}
        onIsAlwaysRunChange={onIsAlwaysRunChange}
        onIsAlwaysRunReset={userValues.is_always_run !== undefined ? onIsAlwaysRunReset : undefined}
        onRunIfChange={onRunIfChange}
        userValuesRunIf={isDefaultMode ? defaultValues.run_if : userValues.run_if}
      />
      <StepBundleConfigInputs />
    </Box>
  );
};

export default StepBundleConfigurationTab;
