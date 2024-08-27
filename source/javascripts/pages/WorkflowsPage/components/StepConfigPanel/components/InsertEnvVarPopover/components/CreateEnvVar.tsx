import { useForm } from 'react-hook-form';
import { Box, Button, ButtonGroup, Checkbox, Input, Text } from '@bitrise/bitkit';
import { EnvVar } from '@/core/models/EnvVar';
import EnvVarService from '@/core/models/EnvVarService';
import { CreateEnvVarFormValues, HandlerFn } from '../types';

type Props = {
  items: EnvVar[];
  onCreate: HandlerFn;
  onCancel: VoidFunction;
};

const CreateEnvVar = ({ items, onCreate, onCancel }: Props) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<CreateEnvVarFormValues>();

  const handleCancel = () => {
    onCancel();
    reset();
  };

  const handleCreate = handleSubmit((formData) => {
    onCreate(formData);
    reset();
  });

  return (
    <Box as="form" onSubmit={handleCreate} display="flex" flexDirection="column">
      <Box display="flex" flexDir="column" gap="8" paddingTop="12" paddingBottom="24">
        <Box display="flex" gap="8" alignItems="top" fontFamily="mono" textStyle="body/md/regular">
          <Input
            autoFocus
            isRequired
            flex="1"
            aria-label="Key"
            leftIconName="Dollars"
            placeholder="Enter key"
            errorText={errors.key?.message}
            {...register('key', {
              validate: (v) =>
                EnvVarService.validateKey(
                  v,
                  items.map((i) => i.key),
                ),
            })}
          />
          <Text pt="14">=</Text>
          <Input
            isRequired
            flex="1"
            aria-label="Value"
            placeholder="Enter value"
            errorText={errors.value?.message}
            {...register('value', {
              validate: (v) => EnvVarService.validateValue(v),
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
        <Button size="sm" variant="tertiary" onClick={handleCancel}>
          Cancel
        </Button>
      </ButtonGroup>
    </Box>
  );
};

export default CreateEnvVar;
