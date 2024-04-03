import { Box, Checkbox, Input, Text } from '@bitrise/bitkit';
import { useFormContext } from 'react-hook-form';

import { CreateSecretFormValues, Secret } from '../types';

type Props = {
  secrets: Secret[];
};

const CreateSecret = ({ secrets }: Props) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<CreateSecretFormValues>();

  return (
    <Box display="flex" flexDirection="column" gap="24">
      <Box display="flex" gap="8">
        <Input
          autoFocus
          isRequired
          flex="1"
          label="Key"
          leftIconName="Dollars"
          placeholder="Enter key"
          errorText={errors.key?.message?.toString()}
          {...register('key', {
            required: true,
            pattern: {
              value: /^[a-zA-Z_]([a-zA-Z0-9_]+)?$/i,
              message: 'Should contain letters, numbers, underscores, should not begin with a number.',
            },
            validate: {
              isUnique: (value) => {
                if (secrets.some((secret) => secret.key === value)) {
                  return 'Secret key should be unique.';
                }

                return true;
              },
            },
          })}
        />
        <Text pt="35">=</Text>
        <Input
          isRequired
          flex="1"
          label="Value"
          placeholder="Enter value"
          errorText={errors.value?.message?.toString()}
          {...register('value', {
            required: true,
            validate: {
              isNotEmpty: (value) => !!value.trim() || 'Secret value should not be empty.',
            },
          })}
        />
      </Box>
      <Box display="flex" gap="24">
        <Checkbox {...register('isExpand')} flex="1">
          Replace variables in inputs
        </Checkbox>
        <Checkbox {...register('isExpose')} flex="1">
          Expose for Pull Requests
        </Checkbox>
      </Box>
    </Box>
  );
};

export default CreateSecret;
