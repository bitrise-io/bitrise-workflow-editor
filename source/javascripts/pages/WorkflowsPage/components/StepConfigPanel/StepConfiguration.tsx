import { useEffect } from 'react';
import { Badge, Box, Card, Divider, ExpandableCard, Text, Toggle } from '@bitrise/bitkit';
import { FormProvider, useForm } from 'react-hook-form';

import { InputCategory, Step } from '@/models';
import StepInput from './components/StepInput/StepInput';
import StepInputList from './components/StepInputList';

type StepConfigurationProps = {
  step: Step;
  inputCategories: InputCategory[];
  onChange: (data: Record<string, unknown>) => void;
};

const extractDefaultValues = (step: Step, inputCategories: InputCategory[]) => {
  return {
    run_if: step.runIf(),
    ...inputCategories.reduce<Record<string, unknown>>((a, category) => {
      return {
        ...a,
        ...category.inputs.reduce<Record<string, unknown>>((b, input) => {
          return { ...b, [input.key()]: input.value() };
        }, {}),
      };
    }, {}),
  };
};

const StepConfiguration = ({ step, inputCategories, onChange }: StepConfigurationProps) => {
  const defaultValues = extractDefaultValues(step, inputCategories);
  const form = useForm<Record<string, unknown>>({ mode: 'all', defaultValues });

  /**
   * NOTE: The native form onChange handler is NOT called on input clear,
   *       so we need to react to changes with a registered onChange callback.
   *
   * @see StepInput onClear function
   */
  useEffect(() => {
    form.trigger();
    const { unsubscribe } = form.watch(onChange);
    return () => unsubscribe();
  }, [onChange, form]);

  return (
    <FormProvider {...form}>
      <Box as="form" display="flex" flexDir="column" p="12" gap="12">
        <ExpandableCard
          className="step-inputs-category when-to-run"
          buttonContent={<Text fontWeight="demiBold">When to run</Text>}
        >
          <Box display="flex">
            <Text flex="1">Run even if previous Steps failed</Text>
            <Toggle {...form.register('is_always_run')} defaultChecked={step.isAlwaysRun()} />
          </Box>
          <Divider my="24" />
          <Box display="flex">
            <Text flex="1">Continue build even if this Step fails</Text>
            <Toggle {...form.register('is_skippable')} defaultChecked={step.isSkippable()} />
          </Box>
          <Divider my="24" />
          <StepInput
            {...form.register('run_if')}
            label="Additional run conditions"
            helper={{
              summary:
                "Enter any valid **Go template** - the Step will only run if it evaluates to `true`, otherwise it won't run. You can refer to Env Vars and more, see the [docs for details](https://devcenter.bitrise.io/en/steps-and-workflows/introduction-to-steps/enabling-or-disabling-a-step-conditionally.html).",
            }}
          />
        </ExpandableCard>

        {inputCategories.map((category, index) => {
          const key = [step.displayName(), category.name || 'group', index].join('');

          if (!category.name) {
            return (
              <Card key={key} variant="outline" p="16" className="step-inputs-group">
                <StepInputList inputs={category.inputs} />
              </Card>
            );
          }

          const numberOfErrors = category.inputs.reduce((prev, input) => {
            return prev + Number(form.getFieldState(input.key()).invalid);
          }, 0);

          return (
            <ExpandableCard
              key={key}
              className="step-inputs-category"
              buttonContent={
                <Box display="flex" gap="8">
                  <Text fontWeight="demiBold">{category.name}</Text>
                  {!!numberOfErrors && (
                    <Badge variant="bold" colorScheme="negative">
                      {numberOfErrors}
                    </Badge>
                  )}
                </Box>
              }
            >
              <StepInputList inputs={category.inputs} />
            </ExpandableCard>
          );
        })}
      </Box>
    </FormProvider>
  );
};

export default StepConfiguration;
