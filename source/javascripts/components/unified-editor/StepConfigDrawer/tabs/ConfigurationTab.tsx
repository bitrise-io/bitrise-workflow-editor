import { Box } from '@bitrise/bitkit';
import { ChangeEventHandler } from 'react';
import { useDebounceCallback } from 'usehooks-ts';

import StepService from '@/core/services/StepService';
import StepVariableService from '@/core/services/StepVariableService';

import WhenToRunCard from '../../WhenToRunCard/component';
import StepInputGroup from '../components/StepInputGroup';
import { useStepDrawerContext } from '../StepConfigDrawer.context';

const ConfigurationTab = () => {
  const { data, workflowId, stepBundleId, stepIndex } = useStepDrawerContext();
  const updateStepInput = useDebounceCallback(StepService.updateStepInput, 250);

  const userValues = data?.userValues ?? {};
  const defaultValues = data?.defaultValues ?? {};
  const mergedValues = data?.mergedValues ?? {};

  const onInputValueChange = (name: string, value?: string | null) => {
    const isNameValid = defaultValues.inputs?.some((input) => Object.keys(input).includes(name));

    // Trying to write a non-existing input
    if (!isNameValid) {
      return;
    }

    const source = stepBundleId ? 'step_bundles' : 'workflows';
    const sourceId = stepBundleId || workflowId;

    updateStepInput(source, sourceId, stepIndex, name, value);
  };

  const onIsAlwaysRunChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const source = stepBundleId ? 'step_bundles' : 'workflows';
    const sourceId = stepBundleId || workflowId;
    StepService.updateStepField(source, sourceId, stepIndex, 'is_always_run', e.currentTarget.checked);
  };

  const onIsSkippableChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const source = stepBundleId ? 'step_bundles' : 'workflows';
    const sourceId = stepBundleId || workflowId;
    StepService.updateStepField(source, sourceId, stepIndex, 'is_skippable', e.currentTarget.checked);
  };

  const onRunIfChange = (runIf: string) => {
    const source = stepBundleId ? 'step_bundles' : 'workflows';
    const sourceId = stepBundleId || workflowId;
    StepService.updateStepField(source, sourceId, stepIndex, 'run_if', runIf);
  };

  return (
    <Box display="flex" flexDir="column" gap="12">
      <WhenToRunCard
        defaultValuesRunIf={defaultValues.run_if}
        isAlwaysRun={mergedValues.is_always_run}
        isSkippable={mergedValues.is_skippable}
        onIsAlwaysRunChange={onIsAlwaysRunChange}
        onIsSkippableChange={onIsSkippableChange}
        onRunIfChange={onRunIfChange}
        userValuesRunIf={userValues.run_if}
      />

      {data?.id &&
        Object.entries(StepVariableService.group(defaultValues.inputs)).map(([title, defaults]) => (
          <StepInputGroup
            key={title}
            title={title}
            stepId={data.id}
            defaults={defaults}
            inputs={userValues.inputs ?? []}
            onChange={onInputValueChange}
          />
        ))}
    </Box>
  );
};

export default ConfigurationTab;
