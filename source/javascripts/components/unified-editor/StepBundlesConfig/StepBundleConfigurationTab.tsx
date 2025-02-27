/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState } from 'react';
import { Box, Button, ButtonGroup, EmptyState, Input, Link, Text, useDisclosure } from '@bitrise/bitkit';
import { Collapse } from '@chakra-ui/react';
import { FormProvider, useController, useForm } from 'react-hook-form';
import StepInput from '../StepConfigDrawer/components/StepInput';
import { FormItems } from './StepBundle.types';
import StepBundleAdditionalFields from './StepBundleAdditionalFields';

const StepBundleConfigurationTab = () => {
  const [showInputs, setShowInputs] = useState(false);
  const { isOpen, onToggle } = useDisclosure();

  const formMethods = useForm<FormItems>({
    defaultValues: {
      key: '',
      value: '',
      opts: {
        title: '',
        summary: '',
        value_options: [],
        category: '',
        description: '',
        is_required: false,
        is_expand: false,
        is_sensitive: false,
        is_dont_change_value: false,
      },
    },
  });

  const { control, handleSubmit, register, reset } = formMethods;

  const { field } = useController({ control, name: 'value' });

  const onFormSubmit = (data: FormItems) => {
    const { key, value, opts } = data;
    console.log({ [key]: value, opts });
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
            <Input
              label="Title"
              helperText="This will be the label of the input. Keep it short and descriptive."
              size="md"
              isRequired
              {...register('opts.title')}
            />
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Input
                label="Key"
                helperText="Use this key as variable in Step inputs."
                size="md"
                flex={1}
                isRequired
                {...register('key')}
              />
              <Text mx={8}>=</Text>
              <Box flex={1}>
                <Box flex={1}>
                  <StepInput label="Default value" helperText="Value must be a string." {...field} />
                </Box>
              </Box>
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
