import { Box, Divider, ExpandableCard, Text, Toggle } from '@bitrise/bitkit';
import { Step } from '@/core/models/Step';
import StepInput from '../components/StepInput';
import { useStepDrawerContext } from '../StepConfigDrawer.context';
import StepInputGroup from '../components/StepInputGroup';

function groupStepInputs(inputs?: Step['inputs']) {
  return inputs?.reduce<Record<string, Step['inputs']>>((groups, input) => {
    const category = input.opts?.category ?? '';
    return {
      ...groups,
      ...{ [category]: [...(groups[category] ?? []), input] },
    };
  }, {});
}

const ConfigurationTab = () => {
  const { step, isLoading } = useStepDrawerContext();

  if (isLoading) {
    return <>Loading...</>;
  }

  return (
    <Box display="flex" flexDir="column" gap="12">
      <ExpandableCard buttonContent={<Text textStyle="body/lg/semibold">When to run</Text>}>
        <Box display="flex">
          <Text flex="1">Run if previous Step(s) failed</Text>
          <Toggle name="is_always_run" defaultChecked={Boolean(step?.is_always_run)} />
        </Box>
        <Divider my="24" />
        <StepInput
          name="run_if"
          defaultValue={step?.run_if}
          label="Additional run conditions"
          helperText="Enter any valid **Go template** - the Step will only run if it evaluates to `true`, otherwise it won't run. You can refer to Env Vars and more, see the [docs for details](https://devcenter.bitrise.io/en/steps-and-workflows/introduction-to-steps/enabling-or-disabling-a-step-conditionally.html)."
        />
      </ExpandableCard>

      {Object.entries(groupStepInputs(step?.inputs) ?? {}).map(([title, inputs]) => {
        return <StepInputGroup key={title} title={title} inputs={inputs} />;
      })}
    </Box>
  );
};

export default ConfigurationTab;
