import { Checkbox } from '@bitrise/bitkit';
import { BitkitButton, BitkitTextInput, IconDollar } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { ButtonGroup } from '@chakra-ui/react/button';
import { Text } from '@chakra-ui/react/text';
import { useForm } from 'react-hook-form';

import AutoGrowableInput from '@/components/AutoGrowableInput';
import { Secret } from '@/core/models/Secret';
import SecretService from '@/core/services/SecretService';
import ignore1Password from '@/utils/ignore1Password';

type Props = {
  items: Secret[];
  onCreate: (item: Secret) => void;
  onCancel: VoidFunction;
};

const CreateSecret = ({ onCreate, onCancel }: Props) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<Secret>();

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
          <BitkitTextInput
            optional
            flex="1"
            size="md"
            label="Key"
            labelHidden
            startElement={<IconDollar size="16" />}
            placeholder="Enter key"
            inputRef={ignore1Password}
            errorText={errors.key?.message}
            inputProps={{
              autoFocus: true,
              ...register('key', {
                validate: SecretService.validateKey,
              }),
            }}
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
          <Checkbox {...register('isExpand')} flex="1">
            Replace variables in inputs
          </Checkbox>
          <Checkbox {...register('isExpose')} flex="1">
            Expose for Pull Requests
          </Checkbox>
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
