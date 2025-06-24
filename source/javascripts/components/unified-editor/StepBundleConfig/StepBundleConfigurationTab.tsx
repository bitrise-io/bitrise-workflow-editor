import { Box } from '@bitrise/bitkit';
import { ChangeEventHandler } from 'react';

import StepBundleService from '@/core/services/StepBundleService';

import WhenToRunCard from '../WhenTorunCard/WhenTorunCard';
import { useStepBundleConfigContext } from './StepBundleConfig.context';
import StepBundleConfigInputs from './StepBundleConfigInputs';

const StepBundleConfigurationTab = () => {
  const { stepBundle, stepBundleId, parentStepBundleId, parentWorkflowId, stepIndex } = useStepBundleConfigContext();

  const defaultValues = stepBundle?.defaultValues ?? {};
  const userValues = stepBundle?.userValues ?? {};
  const mergedValues = stepBundle?.mergedValues ?? {};

  const isDefaultMode = !parentStepBundleId && !parentWorkflowId;

  const at = {
    cvs: stepBundle?.cvs || `bundle::${stepBundle?.id}`,
    source: parentStepBundleId ? 'step_bundles' : ('workflows' as 'step_bundles' | 'workflows'),
    sourceId: parentStepBundleId || parentWorkflowId || '',
    stepIndex,
  };

  const onIsAlwaysRunChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (stepBundleId) {
      if (isDefaultMode) {
        StepBundleService.updateStepBundleField(stepBundleId, 'is_always_run', e.currentTarget.checked);
      } else {
        StepBundleService.updateStepBundleInstanceField('is_always_run', e.currentTarget.checked, at);
      }
    }
  };

  const onIsAlwaysRunReset = () => {
    if (stepBundleId) {
      StepBundleService.updateStepBundleInstanceField('is_always_run', undefined, at);
    }
  };

  const onRunIfChange = (runIf: string) => {
    if (stepBundleId) {
      if (isDefaultMode) {
        StepBundleService.updateStepBundleField(stepBundleId, 'run_if', runIf);
      } else {
        StepBundleService.updateStepBundleInstanceField('run_if', runIf, at);
      }
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
