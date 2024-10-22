import { Box, Divider, ExpandableCard, Text, Toggle } from '@bitrise/bitkit';
import { useDebounceCallback } from 'usehooks-ts';
import { StepInputVariable } from '@/core/models/Step';
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
  const { data, workflowId, stepIndex } = useStepDrawerContext();

  const updateStep = useDebounceCallback(
    useBitriseYmlStore((s) => s.updateStep),
    250,
  );

  const updateStepInputs = useDebounceCallback(
    useBitriseYmlStore((s) => s.updateStepInputs),
    250,
  );

  const mergedValues = data?.mergedValues ?? {};
  const defaultValues = data?.defaultValues ?? {};

  const onInputValueChange = (name: string, value?: string | null) => {
    const clone = JSON.parse(JSON.stringify(mergedValues.inputs ?? [])) as StepInputVariable[];

    clone.forEach(({ opts, ...input }, index) => {
      if (Object.keys(input).includes(name)) {
        clone[index][name] = value;
      }
    });

    updateStepInputs(workflowId, stepIndex, clone, defaultValues.inputs ?? mergedValues.inputs ?? []);
  };

  return (
    <Box display="flex" flexDir="column" gap="12">
      <ExpandableCard buttonContent={<Text textStyle="body/lg/semibold">When to run</Text>}>
        <Box display="flex">
          <Text flex="1">Run even if previous Step(s) failed</Text>
          <Toggle
            defaultChecked={mergedValues.is_always_run}
            onChange={(e) =>
              updateStep(workflowId, stepIndex, { is_always_run: e.currentTarget.checked }, defaultValues)
            }
          />
        </Box>
        <Divider my="24" />
        <Box display="flex">
          <Text flex="1">Continue build even if this Step fails</Text>
          <Toggle
            defaultChecked={mergedValues.is_skippable}
            onChange={(e) =>
              updateStep(workflowId, stepIndex, { is_skippable: e.currentTarget.checked }, defaultValues)
            }
          />
        </Box>
        <Divider my="24" />
        <StepInput
          label="Additional run conditions"
          helperText="Enter any valid **Go template** - the Step will only run if it evaluates to `true`, otherwise it won't run. You can refer to Env Vars and more, see the [docs for details](https://devcenter.bitrise.io/en/steps-and-workflows/introduction-to-steps/enabling-or-disabling-a-step-conditionally.html)."
          defaultValue={mergedValues.run_if}
          onChange={(changedValue) => updateStep(workflowId, stepIndex, { run_if: changedValue }, defaultValues)}
        />
      </ExpandableCard>

      {Object.entries(groupStepInputs(mergedValues.inputs) ?? {}).map(([title, inputs]) => {
        return <StepInputGroup key={title} title={title} inputs={inputs} onChange={onInputValueChange} />;
      })}
    </Box>
  );
};

export default ConfigurationTab;
