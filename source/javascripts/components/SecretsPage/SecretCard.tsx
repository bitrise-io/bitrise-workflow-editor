import { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  CardProps,
  Checkbox,
  Dialog,
  DialogBody,
  DialogFooter,
  Icon,
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
  isKeyUsed: (key: string) => boolean;
}

const SecretCard = (props: SecretCardProps) => {
  const { onEdit, onCancel, onSave, onDelete, secret, appSlug, isKeyUsed } = props;

  const [isShown, setIsShown] = useState(false);
  const [confirmCallback, setConfirmCallback] = useState<() => void | undefined>();

  const {
    call: fetchSecretValue,
    value: fetchedSecretValue,
    isLoading: isSecretValueLoading,
  } = useGetSecretValue(appSlug, secret.key);

  const {
    register,
    watch,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SecretWithState>({
    values: { ...secret, value: secret.isEditing || isShown ? fetchedSecretValue || secret.value : '••••••••' },
  });

  const showSecretValue = () => {
    setIsShown(true);

    if (secret.isSaved && !secret.isProtected) {
      fetchSecretValue();
    }
  };

  const hideSecretValue = () => {
    setIsShown(false);
  };

  const onFormSubmit = (formData: SecretWithState) => {
    if (!secret.isProtected && formData.isProtected) {
      setConfirmCallback(() => () => saveForm(formData));
    } else {
      saveForm(formData);
    }
  };

  const saveForm = (formData: SecretWithState) => {
    setIsShown(false);
    onSave(formData);
  };

  const onCancelClick = () => {
    setIsShown(false);

    onCancel();
  };

  const protectedIcon = <Icon size="16" name="Lock" color="icon/tertiary" margin="12" />;

  const showHideButton = (
    <IconButton
      size="md"
      iconName={isShown ? 'HidePassword' : 'ShowPassword'}
      onClick={() => (isShown ? hideSecretValue() : showSecretValue())}
      aria-label={isShown ? 'Hide' : 'Show'}
      borderLeftRadius={0}
      variant="secondary"
    />
  );

  let valueInputAddon;

  if (!secret.isEditing) {
    if (secret.isProtected) {
      valueInputAddon = protectedIcon;
    } else if (!secret.isShared) {
      valueInputAddon = showHideButton;
    }
  }

  return (
    <Card paddingY="16" paddingX="24" marginBottom="16">
      <Box as="form" onSubmit={handleSubmit(onFormSubmit)} width="100%" display="flex" gap="12" flexDir="column">
        <Box width="100%" display="flex" gap="8">
          <Box flexGrow="1" display="grid" gridTemplateColumns="1fr auto 1fr" gap="8" alignItems="start">
            <Input
              flexGrow={1}
              inputHeight={40}
              isDisabled={secret.isSaved}
              errorText={errors?.key?.message}
              {...register('key', {
                validate: (v) => !isKeyUsed(v) || 'This key is already used!',
              })}
            />
            <Box as="span" lineHeight="40px">
              =
            </Box>
            {isSecretValueLoading ? (
              <Skeleton isActive height="40">
                <SkeletonBox width="100%" height="100%" borderRadius="4" />
              </Skeleton>
            ) : (
              <Input
                inputHeight={40}
                isDisabled={!secret.isEditing}
                type={isShown || secret.isEditing ? 'text' : 'password'}
                rightAddon={valueInputAddon}
                rightAddonPlacement="inside"
                {...register('value', { required: 'This field is required.' })}
              />
            )}
          </Box>
          {secret.isShared ? (
            <Box width="88px" display="flex" alignItems="center" justifyContent="center">
              <Badge background="sys/neutral/subtle" color="text/secondary">
                Shared
              </Badge>
            </Box>
          ) : (
            <>
              {!secret.isEditing && (
                <Box display="flex">
                  <IconButton
                    size="md"
                    iconSize="24"
                    color="button/secondary"
                    iconName="Pencil"
                    aria-label="Edit secret"
                    variant="tertiary"
                    onClick={() => {
                      showSecretValue();

                      onEdit?.(secret.key);
                    }}
                    marginLeft="8"
                  />
                  <IconButton
                    size="md"
                    iconSize="24"
                    iconName="MinusRemove"
                    aria-label="Delete secret"
                    variant="tertiary"
                    isDanger
                    onClick={() => onDelete?.(secret.key)}
                  />
                </Box>
              )}
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
              isChecked={watch('isExpand')}
              {...register('isExpand')}
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
              isChecked={watch('isExpose')}
              {...register('isExpose')}
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
              isChecked={watch('isProtected')}
              {...register('isProtected')}
              isReadOnly={secret.isProtected}
              style={secret.isProtected ? { opacity: 0.4, pointerEvents: 'none' } : {}}
              // onClick={() => onProtectedChange(secret)}
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
                <Button type="submit" size="md" isDisabled={!watch('key') || !watch('value')}>
                  Save
                </Button>
                <Button onClick={onCancelClick} size="md" variant="secondary">
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

      <Dialog title="Save and protect Secret permanently?" maxWidth="640" isOpen={!!confirmCallback} onClose={() => {}}>
        <DialogBody>
          <Text>
            Making a Secret protected is irreversible. <br />
            To change the value, you will need to delete this Secret Environment Variable and create a new one.
          </Text>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => {
              setValue('isProtected', false);
              setConfirmCallback(undefined);
            }}
          >
            Cancel
          </Button>
          <Button
            isDanger
            onClick={() => {
              confirmCallback?.();
              setConfirmCallback(undefined);
            }}
          >
            Save and protect
          </Button>
        </DialogFooter>
      </Dialog>
    </Card>
  );
};

export default SecretCard;
