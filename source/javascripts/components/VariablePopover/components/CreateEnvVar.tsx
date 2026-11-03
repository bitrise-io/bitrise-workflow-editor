import { Checkbox } from '@bitrise/bitkit';
import { BitkitButton, BitkitTextArea, BitkitTextInput, IconDollar } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { ButtonGroup } from '@chakra-ui/react/button';
import { Text } from '@chakra-ui/react/text';
import { useForm } from 'react-hook-form';

import { EnvVar } from '@/core/models/EnvVar';
import EnvVarService from '@/core/services/EnvVarService';
import ignore1Password, { ignore1PasswordProps } from '@/utils/ignore1Password';

type Props = {
  items: EnvVar[];
  onCreate: (envVar: EnvVar) => void;
  onCancel: VoidFunction;
};

const CreateEnvVar = ({ onCreate, onCancel }: Props) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<EnvVar>();

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
                validate: EnvVarService.validateKey,
              }),
            }}
          />
          <Text paddingBlockStart="12">=</Text>
          <BitkitTextArea
            optional
            flex="1"
            autoresize
            rows={1}
            size="md"
            label="Value"
            labelHidden
            placeholder="Enter value"
            errorText={errors.value?.message}
            textareaProps={{ ...register('value'), ...ignore1PasswordProps, wrap: 'off' }}
          />
        </Box>
        <Checkbox isRequired={false} {...register('isExpand')} marginTop="16">
          Replace variable in inputs
        </Checkbox>
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

export default CreateEnvVar;
