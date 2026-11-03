import { Input } from '@bitrise/bitkit';
import { BitkitButton, BitkitCheckbox } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { ButtonGroup } from '@chakra-ui/react/button';
import { Text } from '@chakra-ui/react/text';
import { Controller, useForm } from 'react-hook-form';

import AutoGrowableInput from '@/components/AutoGrowableInput';
import { Secret } from '@/core/models/Secret';
import SecretService from '@/core/services/SecretService';

type Props = {
  items: Secret[];
  onCreate: (item: Secret) => void;
  onCancel: VoidFunction;
};

const CreateSecret = ({ onCreate, onCancel }: Props) => {
  const {
    control,
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<Secret>({ defaultValues: { isExpand: false, isExpose: false } });

  const handleCancel = () => {
    onCancel();
    reset();
  };

  const handleCreate = handleSubmit((formData) => {
    onCreate(formData);
    reset();
  });

  return (
    <Box
      as="form"
      onSubmit={(e) => {
        e.stopPropagation();
        handleCreate(e);
      }}
      display="flex"
      flexDirection="column"
    >
      <Box display="flex" flexDirection="column" gap="8" paddingBlockStart="12" paddingBlockEnd="24">
        <Box display="flex" gap="8" alignItems="top" fontFamily="mono" textStyle="body/md/regular">
          <Input
            autoFocus
            flex="1"
            size="md"
            aria-label="Key"
            leftIconName="Dollars"
            placeholder="Enter key"
            inputRef={(ref) => ref?.setAttribute('data-1p-ignore', '')}
            errorText={errors.key?.message}
            {...register('key', {
              validate: SecretService.validateKey,
            })}
          />
          <Text paddingBlockStart="12">=</Text>
          <AutoGrowableInput
            aria-label="Value"
            placeholder="Enter value"
            formControlProps={{ flex: '1' }}
            errorText={errors.value?.message}
            {...register('value')}
          />
        </Box>
        <Box display="flex" gap="24" marginBlockStart="16">
          <Controller
            control={control}
            name="isExpand"
            render={({ field }) => (
              <BitkitCheckbox
                labelText="Replace variables in inputs"
                flex="1"
                checked={!!field.value}
                name={field.name}
                onCheckedChange={({ checked }) => field.onChange(checked === true)}
              />
            )}
          />
          <Controller
            control={control}
            name="isExpose"
            render={({ field }) => (
              <BitkitCheckbox
                labelText="Expose for Pull Requests"
                flex="1"
                checked={!!field.value}
                name={field.name}
                onCheckedChange={({ checked }) => field.onChange(checked === true)}
              />
            )}
          />
        </Box>
      </Box>
      <ButtonGroup gap="12">
        <BitkitButton size="sm" type="submit">
          Create
        </BitkitButton>
        <BitkitButton size="sm" variant="tertiary" onClick={handleCancel}>
          Cancel
        </BitkitButton>
      </ButtonGroup>
    </Box>
  );
};

export default CreateSecret;
