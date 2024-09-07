import { Box, Divider, ExpandableCard, Text, Toggle } from '@bitrise/bitkit';
import { Controller, useFormContext } from 'react-hook-form';
import { StepInputVariable } from '@/core/models/Step';
import StepInput from '../components/StepInput';
import { useStepDrawerContext } from '../StepConfigDrawer.context';
import StepInputGroup from '../components/StepInputGroup';
import { FormValues } from '../StepConfigDrawer.types';

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
  const { data } = useStepDrawerContext();
  const { mergedValues } = data ?? {};
  const form = useFormContext<FormValues>();

  return (
    <Box display="flex" flexDir="column" gap="12">
      <ExpandableCard buttonContent={<Text textStyle="body/lg/semibold">When to run</Text>}>
        <Box display="flex">
          <Text flex="1">Run if previous Step(s) failed</Text>
          <Controller
            control={form.control}
            name="configuration.is_always_run"
            render={({ field: { value, ...rest } }) => <Toggle isChecked={value} {...rest} />}
          />
        </Box>
        <Divider my="24" />
        <Box display="flex">
          <Text flex="1">Continue build even if this Step failed</Text>
          <Controller
            control={form.control}
            name="configuration.is_skippable"
            render={({ field: { value, ...rest } }) => <Toggle isChecked={value} {...rest} />}
          />
        </Box>
        <Divider my="24" />
        <StepInput
          label="Additional run conditions"
          helperText="Enter any valid **Go template** - the Step will only run if it evaluates to `true`, otherwise it won't run. You can refer to Env Vars and more, see the [docs for details](https://devcenter.bitrise.io/en/steps-and-workflows/introduction-to-steps/enabling-or-disabling-a-step-conditionally.html)."
          {...form.register('configuration.run_if')}
        />
      </ExpandableCard>

      {Object.entries(groupStepInputs(mergedValues?.inputs) ?? {}).map(([title, inputs]) => {
        return <StepInputGroup key={title} title={title} inputs={inputs} />;
      })}
    </Box>
  );
};

export default ConfigurationTab;
