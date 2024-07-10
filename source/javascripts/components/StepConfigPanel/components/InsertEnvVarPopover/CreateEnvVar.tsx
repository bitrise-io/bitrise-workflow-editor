import { useForm } from 'react-hook-form';
import { Box, Button, ButtonGroup, Checkbox, Input, Text } from '@bitrise/bitkit';
import { CreateEnvVarFormValues, EnvironmentVariable, HandlerFn } from './InsertEnvVarPopover.types';

type Props = {
  items: EnvironmentVariable[];
  onCreate: HandlerFn;
  onCancel: VoidFunction;
};

const CreateEnvVar = ({ items, onCreate, onCancel }: Props) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<CreateEnvVarFormValues>();

  return (
    <Box as="form" onSubmit={handleSubmit(onCreate)} display="flex" flexDirection="column">
      <Box display="flex" flexDir="column" gap="8" paddingTop="12" paddingBottom="24">
        <Box display="flex" gap="8" alignItems="top" fontFamily="mono" textStyle="body/md/regular">
          <Input
            autoFocus
            isRequired
            flex="1"
            aria-label="Key"
            leftIconName="Dollars"
            placeholder="Enter key"
            errorText={errors.key?.message?.toString()}
            {...register('key', {
              required: true,
              pattern: {
                value: /^[a-zA-Z_]([a-zA-Z0-9_]+)?$/i,
                message: 'Key should contain letters, numbers, underscores, should not begin with a number.',
              },
              validate: {
                isUnique: (value) => {
                  if (items.some((secret) => secret.key === value)) {
                    return 'Key should be unique.';
                  }

                  return true;
                },
              },
            })}
          />
          <Text pt="14">=</Text>
          <Input
            isRequired
            flex="1"
            aria-label="Value"
            placeholder="Enter value"
            errorText={errors.value?.message?.toString()}
            {...register('value', {
              required: true,
              validate: {
                isNotEmpty: (value) => !!value.trim() || 'Value should not be empty.',
              },
            })}
          />
        </Box>
        <Checkbox isRequired={false} {...register('isExpand')} marginTop="16">
          Replace variable in inputs
        </Checkbox>
      </Box>
      <ButtonGroup spacing="12">
        <Button size="sm" type="submit">
          Create
        </Button>
        <Button size="sm" variant="tertiary" onClick={onCancel}>
          Cancel
        </Button>
      </ButtonGroup>
    </Box>
  );
};

export default CreateEnvVar;
