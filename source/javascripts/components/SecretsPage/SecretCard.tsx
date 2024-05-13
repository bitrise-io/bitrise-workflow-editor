import {
  Box,
  Button,
  Card,
  CardProps,
  Checkbox,
  IconButton,
  Input,
  Skeleton,
  SkeletonBox,
  Text,
} from '@bitrise/bitkit';

import { useForm } from 'react-hook-form';
import useGetSecretValue from '../../hooks/api/useGetSecretValue';
import { SecretWithState } from '../../models';

interface SecretCardProps extends CardProps {
  appSlug: string;
  secret: SecretWithState;
  onEdit: (id: string) => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
  onSave: (secret: SecretWithState) => void;
}

const SecretCard = (props: SecretCardProps) => {
  const { onEdit, onCancel, onSave, onDelete, secret, appSlug } = props;

  const {
    call: getSecretValue,
    value: fetchedSecretValue,
    isLoading: isSecretValueLoading,
  } = useGetSecretValue(appSlug, secret.key);

  const form = useForm<SecretWithState>({
    values: { ...secret, value: fetchedSecretValue || secret.value },
  });

  const inputWidth = `calc((100% - ${secret.isEditing ? 0 : 108}px) / 2)`;

  return (
    <Card paddingY="16" paddingX="24" marginBottom="16">
      <Box as="form" onSubmit={form.handleSubmit(onSave)} width="100%" display="flex" gap="12" flexDir="column">
        <Box width="100%" display="flex" gap="8" alignItems="center">
          <Input width={inputWidth} isDisabled={secret.isSaved} {...form.register('key')} />=
          {isSecretValueLoading ? (
            <Skeleton isActive width={inputWidth} height="48">
              <SkeletonBox width="100%" height="100%" borderRadius="4" />
            </Skeleton>
          ) : (
            <Input
              width={inputWidth}
              isDisabled={!secret.isEditing}
              type={secret.isEditing ? 'text' : 'password'}
              {...form.register('value')}
            />
          )}
          {!secret.isEditing && (
            <>
              <IconButton
                iconName="Pencil"
                aria-label="Edit trigger"
                variant="tertiary"
                onClick={() => {
                  if (secret.isSaved && !secret.isProtected) {
                    getSecretValue();
                  }

                  onEdit?.(secret.key);
                }}
                marginLeft="8"
              />
              <IconButton
                iconName="MinusRemove"
                aria-label="Remove trigger"
                variant="tertiary"
                isDanger
                onClick={() => onDelete?.(secret.key)}
              />
            </>
          )}
        </Box>
        {!secret.isEditing && (
          <Text fontSize="16" color="text/secondary">
            {[
              secret.isExpand ? 'Variables are replaced in inputs' : '',
              secret.isExpose ? 'Exposed for pull requests' : '',
              secret.isProtected ? 'Protected' : '',
            ]
              .filter((s) => s)
              .join(' • ')}
          </Text>
        )}
        {secret.isEditing && (
          <Box display="flex" flexDirection="column" marginY="16" gap="16">
            <Checkbox
              isChecked={form.watch('isExpand')}
              {...form.register('isExpand')}
              isReadOnly={secret.isProtected}
              style={secret.isProtected ? { opacity: 0.4, pointerEvents: 'none' } : {}}
            >
              <Box display="flex" flexDirection="column">
                <Text size="3">Replace variables in inputs</Text>
                <Text size="1" color="input/text/helper" casing="none">
                  Enable this if you want to replace Env Vars in your input with the assigned value.
                </Text>
              </Box>
            </Checkbox>
            <Checkbox
              isChecked={form.watch('isExpose')}
              {...form.register('isExpose')}
              isReadOnly={secret.isProtected}
              style={secret.isProtected ? { opacity: 0.4, pointerEvents: 'none' } : {}}
            >
              <Box display="flex" flexDirection="column">
                <Text size="3">Expose for pull requests</Text>
                <Text size="1" color="input/text/helper" casing="none">
                  Be careful, this is a potential security risk.
                </Text>
              </Box>
            </Checkbox>
            <Checkbox
              isChecked={secret.isProtected}
              isReadOnly={secret.isProtected}
              style={secret.isProtected ? { opacity: 0.4, pointerEvents: 'none' } : {}}
            >
              <Box display="flex" flexDirection="column">
                <Text size="3">Protected</Text>
                <Text size="1" color="input/text/helper" casing="none">
                  Value cannot be revealed or changed. Irreversible once saved. Delete to replace.
                </Text>
              </Box>
            </Checkbox>
            <Box display="flex" justifyContent="space-between">
              <Box display="flex" gap="16">
                <Button type="submit" size="md">
                  Done
                </Button>
                <Button onClick={onCancel} size="md" variant="secondary">
                  Cancel
                </Button>
              </Box>
              <Button size="md" variant="danger-secondary" onClick={() => onDelete?.(secret.key)}>
                Delete secret
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Card>
  );
};

export default SecretCard;
