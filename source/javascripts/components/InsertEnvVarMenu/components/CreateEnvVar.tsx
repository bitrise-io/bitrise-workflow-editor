import { forwardRef } from 'react';
import { useForm } from 'react-hook-form';
import { Box, Button, ButtonGroup, Checkbox, Input, Text } from '@bitrise/bitkit';
import { CreateEnvVarFormValues, EnvironmentVariable, HandlerFn } from '../types';

type Props = {
  envVars: EnvironmentVariable[];
  onCreate: HandlerFn;
  onCancel: VoidFunction;
};

const CreateEnvVar = forwardRef<HTMLInputElement, Props>(({ envVars, onCreate, onCancel }: Props, ref) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<CreateEnvVarFormValues>();

  const onCreateHandler = handleSubmit((envVar) => {
    onCreate(envVar);
  });

  const onCancelHandler = () => {
    onCancel();
  };

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDir="column" gap="8" paddingTop="12" paddingBottom="24">
        <Box display="flex" gap="8" alignItems="top" fontFamily="mono" textStyle="body/md/regular">
          <Input
            autoFocus
            inputRef={ref}
            isRequired
            flex="1"
            inputStyle={{ textTransform: 'uppercase' }}
            aria-label="Key"
            leftIconName="Dollars"
            placeholder="Enter key"
            errorText={errors.key?.message?.toString()}
            {...register('key', {
              required: true,
              pattern: {
                value: /^[a-zA-Z_]([a-zA-Z0-9_]+)?$/i,
                message: 'Should contain letters, numbers, underscores, should not begin with a number.',
              },
              setValueAs: (value) => value.toUpperCase(),
              validate: {
                isUnique: (value) => {
                  if (envVars.some((ev) => ev.key === value)) {
                    return 'Environment variable key should be unique.';
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
                isNotEmpty: (value) => !!value.trim() || 'Environment variable value should not be empty.',
              },
            })}
          />
        </Box>
        <Checkbox isRequired={false} {...register('isExpand')} marginTop="16">
          Replace variable in inputs
        </Checkbox>
      </Box>
      <ButtonGroup spacing="12">
        <Button size="sm" onClick={() => onCreateHandler()}>
          Create
        </Button>
        <Button size="sm" variant="tertiary" onClick={onCancelHandler}>
          Cancel
        </Button>
      </ButtonGroup>
    </Box>
  );
});

export default CreateEnvVar;
