import { Box, Divider, ExpandableCard, Text, Toggle } from '@bitrise/bitkit';
import { useDebounceCallback } from 'usehooks-ts';
import { cloneDeep } from 'es-toolkit';
import { StepInputVariable, StepYmlObject } from '@/core/models/Step';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import StepInput from '../components/StepInput';
import { useStepDrawerContext } from '../StepConfigDrawer.context';
import StepInputGroup from '../components/StepInputGroup';

function groupStepInputs(inputs?: StepInputVariable[]) {
  return inputs?.reduce<Record<string, StepInputVariable[]>>((groups, input) => {
    const category = input.opts?.category ?? '';
    return {
      ...groups,
      ...{ [category]: [...(groups[category] ?? []), input] },
    };
  }, {});
}

const ConfigurationTab = () => {
  const { data, workflowId, stepBundleId, stepIndex } = useStepDrawerContext();

  const updateStep = useDebounceCallback(
    useBitriseYmlStore((s) => s.updateStep),
    250,
  );

  const updateStepInStepBundle = useDebounceCallback(
    useBitriseYmlStore((s) => s.updateStepInStepBundle),
    250,
  );

  const updateStepInputs = useDebounceCallback(
    useBitriseYmlStore((s) => s.updateStepInputs),
    250,
  );

  const updateStepInputsInStepBundle = useDebounceCallback(
    useBitriseYmlStore((s) => s.updateStepInputsInStepBundle),
    250,
  );

  const userValues = data?.userValues ?? {};
  const defaultValues = data?.defaultValues ?? {};
  const mergedValues = data?.mergedValues ?? {};

  const onInputValueChange = (name: string, value?: string | null) => {
    const clone = cloneDeep(userValues.inputs ?? []);
    const isNameValid = defaultValues.inputs?.some((input) => Object.keys(input).includes(name));
    const changeIndex = clone.findIndex((input) => Object.keys(input).includes(name));

    // Trying to write a non-existing input
    if (!isNameValid) {
      return;
    }

    if (changeIndex !== -1) {
      clone[changeIndex][name] = value;
    } else {
      clone.push({ [name]: value });
    }

    if (workflowId) {
      updateStepInputs(workflowId, stepIndex, clone);
    }
    if (stepBundleId) {
      updateStepInputsInStepBundle(stepBundleId, stepIndex, clone);
    }
  };

  const onToggleChange = (newValues: Omit<StepYmlObject, 'inputs' | 'outputs'>) => {
    if (workflowId) {
      updateStep(workflowId, stepIndex, newValues);
    }
    if (stepBundleId) {
      updateStepInStepBundle(stepBundleId, stepIndex, newValues);
    }
  };

  return (
    <Box display="flex" flexDir="column" gap="12">
      <ExpandableCard buttonContent={<Text textStyle="body/lg/semibold">When to run</Text>}>
        <Box display="flex">
          <Text flex="1">Run even if previous Step(s) failed</Text>
          <Toggle
            defaultChecked={mergedValues.is_always_run}
            onChange={(e) => onToggleChange({ is_always_run: e.currentTarget.checked })}
          />
        </Box>
        <Divider my="24" />
        <Box display="flex">
          <Text flex="1">Continue build even if this Step fails</Text>
          <Toggle
            defaultChecked={mergedValues.is_skippable}
            onChange={(e) => onToggleChange({ is_skippable: e.currentTarget.checked })}
          />
        </Box>
        <Divider my="24" />
        <StepInput
          label="Additional run conditions"
          helperText="Enter any valid **Go template** - the Step will only run if it evaluates to `true`, otherwise it won't run. You can refer to Env Vars and more, see the [docs for details](https://devcenter.bitrise.io/en/steps-and-workflows/introduction-to-steps/enabling-or-disabling-a-step-conditionally.html)."
          value={userValues.run_if}
          defaultValue={defaultValues.run_if}
          onChange={(changedValue) => onToggleChange({ run_if: changedValue })}
        />
      </ExpandableCard>

      {Object.entries(groupStepInputs(defaultValues.inputs) ?? {}).map(([title, defaults]) => (
        <StepInputGroup
          key={title}
          stepId={data?.id}
          title={title}
          defaults={defaults}
          inputs={groupStepInputs(userValues.inputs)?.[title]}
          onChange={onInputValueChange}
        />
      ))}
    </Box>
  );
};

export default ConfigurationTab;
