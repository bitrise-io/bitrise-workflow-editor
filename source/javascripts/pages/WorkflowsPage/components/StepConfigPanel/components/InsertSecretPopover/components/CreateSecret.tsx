import { Box, Button, ButtonGroup, Checkbox, Input, Text } from '@bitrise/bitkit';
import { useForm } from 'react-hook-form';
import { Secret } from '@/core/models/Secret';
import SecretService from '@/core/models/SecretService';
import { CreateSecretFormValues, HandlerFn } from '../types';

type Props = {
  items: Secret[];
  onCreate: HandlerFn;
  onCancel: VoidFunction;
};

const CreateSecret = ({ items, onCreate, onCancel }: Props) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<CreateSecretFormValues>();

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
                SecretService.validateKey(
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
              validate: SecretService.validateValue,
            })}
          />
        </Box>
        <Box display="flex" gap="24" marginTop="16">
          <Checkbox {...register('isExpand')} flex="1">
            Replace variables in inputs
          </Checkbox>
          <Checkbox {...register('isExpose')} flex="1">
            Expose for Pull Requests
          </Checkbox>
        </Box>
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

export default CreateSecret;
