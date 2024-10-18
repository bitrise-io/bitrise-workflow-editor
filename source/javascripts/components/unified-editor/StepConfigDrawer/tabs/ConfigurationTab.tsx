import { Box, Divider, ExpandableCard, Text, Toggle } from '@bitrise/bitkit';
import { useShallow } from 'zustand/react/shallow';
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
  const { mergedValues = {}, defaultValues = {} } = data ?? {};
  const updateStep = useDebounceCallback(useBitriseYmlStore(useShallow((s) => s.updateStep)), 150);

  return (
    <Box display="flex" flexDir="column" gap="12">
      <ExpandableCard buttonContent={<Text textStyle="body/lg/semibold">When to run</Text>}>
        <Box display="flex">
          <Text flex="1">Run even if previous Step(s) failed</Text>
          <Toggle
            defaultChecked={mergedValues.is_always_run}
            onChange={(e) => updateStep(workflowId, stepIndex, { is_always_run: e.target.checked }, defaultValues)}
          />
        </Box>
        <Divider my="24" />
        <Box display="flex">
          <Text flex="1">Continue build even if this Step fails</Text>
          <Toggle
            defaultChecked={mergedValues.is_skippable}
            onChange={(e) => updateStep(workflowId, stepIndex, { is_skippable: e.target.checked }, defaultValues)}
          />
        </Box>
        <Divider my="24" />
        <StepInput
          label="Additional run conditions"
          helperText="Enter any valid **Go template** - the Step will only run if it evaluates to `true`, otherwise it won't run. You can refer to Env Vars and more, see the [docs for details](https://devcenter.bitrise.io/en/steps-and-workflows/introduction-to-steps/enabling-or-disabling-a-step-conditionally.html)."
          defaultValue={mergedValues.run_if}
          onChange={(e) => updateStep(workflowId, stepIndex, { run_if: e.target.value }, defaultValues)}
        />
      </ExpandableCard>

      {Object.entries(groupStepInputs(mergedValues?.inputs) ?? {}).map(([title, inputs]) => {
        return <StepInputGroup key={title} title={title} inputs={inputs} />;
      })}
    </Box>
  );
};

export default ConfigurationTab;
