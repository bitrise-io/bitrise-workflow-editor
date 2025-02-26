/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState } from 'react';
import { Box, Button, EmptyState, Input, Link, Text } from '@bitrise/bitkit';
import { ButtonGroup, Collapse, useDisclosure } from '@chakra-ui/react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { EnvironmentItemModel } from '@/core/models/BitriseYml';
import StepInput from '../StepConfigDrawer/components/StepInput';
import StepBundleAdditionalFields, { FormItems } from './StepBundleAdditionalFields';

const StepBundleConfigurationTab = () => {
  const [showInputs, setShowInputs] = useState(false);
  const { isOpen, onToggle } = useDisclosure();

  const formMethods = useForm<FormItems>({
    defaultValues: {
      key: '',
      default_value: '',
      opts: {
        title: '',
        summary: '',
        value_options: '',
        category: '',
        description: '',
        is_required: false,
        is_expand: false,
        is_sensitive: false,
        is_dont_change_value: false,
      },
    },
  });

  const { control, handleSubmit, reset } = formMethods;

  const onFormSubmit = (data: FormItems) => {
    const result: EnvironmentItemModel = {
      key: data.key,
      value: data.default_value,
      opts: {
        title: data.opts.title,
        summary: data.opts.summary,
        value_options: data.opts.value_options.split('\n'),
        category: data.opts.category,
        description: data.opts.description,
        is_required: data.opts.is_required,
        is_expand: data.opts.is_expand,
        is_sensitive: data.opts.is_sensitive,
        is_dont_change_value: data.opts.is_dont_change_value,
      },
    };
    console.log(result);
  };

  const handleCancel = () => {
    setShowInputs(false);
    reset();
  };

  return (
    <>
      {!showInputs && (
        <EmptyState
          title="Bundle inputs"
          description="Define input variables to manage multiple Steps within a bundle. Reference their keys in Steps and assign custom
      values for each Workflow."
          p={48}
        >
          <Button
            leftIconName="Plus"
            variant="secondary"
            size="md"
            mt={24}
            onClick={() => {
              setShowInputs(true);
            }}
          >
            Add input
          </Button>
        </EmptyState>
      )}

      {showInputs && (
        <FormProvider {...formMethods}>
          <Box as="form" display="flex" flexDir="column" gap="16" height="100%" onSubmit={handleSubmit(onFormSubmit)}>
            <Text textStyle="heading/h3">New bundle input</Text>
            <Controller
              name="opts.title"
              control={control}
              render={({ field }) => (
                <Input
                  label="Title"
                  helperText="This will be the label of the input. Keep it short and descriptive."
                  size="md"
                  isRequired
                  {...field}
                />
              )}
            />
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Controller
                name="key"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Key"
                    helperText="Use this key as variable in Step inputs."
                    size="md"
                    flex={1}
                    isRequired
                    {...field}
                  />
                )}
              />
              <Text mx={8}>=</Text>
              <Controller
                name="default_value"
                control={control}
                render={({ field }) => (
                  <Box flex={1}>
                    <StepInput label="Default value" helperText="Value must be a string." {...field} />
                  </Box>
                )}
              />
            </Box>
            <Collapse
              in={isOpen}
              transition={{ enter: { duration: 0.2 }, exit: { duration: 0.2 } }}
              style={{ overflow: 'visible' }}
            >
              <StepBundleAdditionalFields />
            </Collapse>
            <Link colorScheme="purple" cursor="pointer" size="2" onClick={onToggle}>
              {isOpen ? 'Show less options' : 'Show more options'}
            </Link>
            <ButtonGroup display="flex" justifyContent="space-between" marginBlockStart="auto">
              <Button variant="tertiary" isDanger onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </ButtonGroup>
          </Box>
        </FormProvider>
      )}
    </>
  );
};

export default StepBundleConfigurationTab;
