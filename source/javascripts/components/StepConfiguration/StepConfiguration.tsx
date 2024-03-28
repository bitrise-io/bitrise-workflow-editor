import { useEffect } from 'react';
import { Box, Card, Divider, ExpandableCard, Text, Toggle } from '@bitrise/bitkit';
import { FormProvider, useForm } from 'react-hook-form';

import { InputCategory, Step } from '../../models';
import StepInput from './components/StepInput/StepInput';
import StepInputList from './components/StepInputList';

type StepConfigurationProps = {
  step: Step;
  inputCategories: InputCategory[];
  onChange: (data: Record<string, unknown>) => void;
};

const StepConfiguration = ({ step, inputCategories, onChange }: StepConfigurationProps) => {
  const form = useForm<Record<string, unknown>>();

  /**
   * NOTE: The native form onChange handler is NOT called on input clear,
   *       so we need to react to changes with a registered onChange callback.
   *
   * @see StepInput onClear function
   */
  useEffect(() => {
    const { unsubscribe } = form.watch(onChange);
    return () => unsubscribe();
  }, [onChange, form]);

  return (
    <FormProvider {...form}>
      <Box as="form" display="flex" flexDir="column" p="12" gap="12">
        <ExpandableCard buttonContent={<Text fontWeight="demiBold">When to run</Text>}>
          <Box display="flex">
            <Text flex="1">Run if previous Step(s) failed</Text>
            <Toggle {...form.register('is_always_run')} defaultChecked={step.isAlwaysRun()} />
          </Box>
          <Divider my="24" />
          <StepInput {...form.register('run_if')} label="Additional run conditions" defaultValue={step.runIf()} />
        </ExpandableCard>

        {inputCategories.map((category, index) => {
          const key = [step.displayName(), category.name || 'group', index].join('');

          if (!category.name) {
            return (
              <Card key={key} variant="outline" p="16">
                <StepInputList inputs={category.inputs} />
              </Card>
            );
          }

          return (
            <ExpandableCard key={key} buttonContent={<Text fontWeight="demiBold">{category.name}</Text>}>
              <StepInputList inputs={category.inputs} />
            </ExpandableCard>
          );
        })}
      </Box>
    </FormProvider>
  );
};

export default StepConfiguration;
