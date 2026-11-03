import { Dialog, DialogBody, DialogFooter, IconButton, Toggletip } from '@bitrise/bitkit';
import {
  BitkitAlert,
  BitkitBadge,
  BitkitButton,
  BitkitCheckbox,
  BitkitIconButton,
  BitkitTextArea,
  BitkitTextInput,
  IconEye,
  IconEyeSlash,
  IconLock,
} from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { Card } from '@chakra-ui/react/card';
import { Skeleton } from '@chakra-ui/react/skeleton';
import { Text } from '@chakra-ui/react/text';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Secret } from '@/core/models/Secret';
import { useSecretValue, useUpsertSecret } from '@/hooks/useSecrets';

interface SecretCardProps {
  appSlug: string;
  secret: Secret;
  onEdit: (id: string) => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
  onSave: (secret: Secret) => void;
  isKeyUsed: (key: string) => boolean;
  secretSettingsUrl?: string;
}

const SecretCard = (props: SecretCardProps) => {
  const { onEdit, onCancel, onSave, onDelete, secret, appSlug, isKeyUsed, secretSettingsUrl } = props;

  const [isShown, setIsShown] = useState(false);
  const [confirmCallback, setConfirmCallback] = useState<() => void | undefined>();

  const { data: fetchedSecretValue, isFetching: isSecretValueLoading } = useSecretValue({
    appSlug,
    secretKey: secret.key,
    options: { enabled: !secret.isProtected && isShown },
  });

  const {
    mutate: saveSecret,
    isError: saveError,
    isPending: saveLoading,
    reset: resetSave,
  } = useUpsertSecret({
    appSlug,
    options: {
      onSuccess(newSecret) {
        resetSave();
        if (newSecret) {
          onSave(newSecret);
        }
      },
    },
  });

  const secretValue = useMemo(() => {
    if (!secret.isEditing && !isShown) {
      return '••••••••';
    }

    if (secret.isProtected) {
      return '';
    }

    return fetchedSecretValue || secret.value;
  }, [fetchedSecretValue, isShown, secret.isEditing, secret.isProtected, secret.value]);

  const {
    control,
    register,
    watch,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Secret>({
    values: {
      ...secret,
      value: secretValue,
    },
  });

  const onFormSubmit = (formData: Secret) => {
    if (secret.isShared) return;

    if (!secret.isProtected && formData.isProtected) {
      setConfirmCallback(() => () => saveForm(formData));
    } else {
      saveForm(formData);
    }
  };

  const saveForm = (formData: Secret) => {
    setIsShown(false);
    saveSecret(formData);
  };

  const onCancelClick = () => {
    setIsShown(false);
    onCancel();
  };

  const protectedIcon = secret.isProtected ? <IconLock size="16" /> : undefined;

  const showHideButton =
    !secret.isProtected && !secret.isShared ? (
      <BitkitIconButton
        size="md"
        variant="secondary"
        label={isShown ? 'Hide' : 'Show'}
        icon={isShown ? IconEyeSlash : IconEye}
        onClick={() => setIsShown(!isShown)}
      />
    ) : undefined;

  const secretValueElement = () => {
    if (isSecretValueLoading) {
      return <Skeleton height="40" borderRadius="4" />;
    }
    if (secret.isEditing) {
      return (
        <BitkitTextArea
          optional
          label="Value"
          labelHidden
          size="md"
          rows={1}
          textareaProps={register('value', { required: 'This field is required.' })}
        />
      );
    }
    return (
      <BitkitTextInput
        optional
        size="md"
        state="readOnly"
        endElement={protectedIcon}
        endAddon={showHideButton}
        value={watch('value') || ''}
        inputProps={{ type: isShown ? 'text' : 'password' }}
      />
    );
  };

  return (
    <Card.Root marginBlockEnd="16" paddingSize="md">
      <Card.Body>
        <Box
          as="form"
          onSubmit={handleSubmit(onFormSubmit)}
          width="100%"
          display="flex"
          gap="12"
          flexDirection="column"
        >
          <Box width="100%" display="flex" gap="8">
            <Box flexGrow="1" display="grid" gridTemplateColumns="1fr auto 1fr" gap="8" alignItems="start">
              <BitkitTextInput
                optional
                flexGrow="1"
                size="md"
                state={secret.isSaved ? 'readOnly' : undefined}
                errorText={errors?.key?.message}
                inputProps={register('key', {
                  validate: (v) => !isKeyUsed(v) || 'This key is already used!',
                })}
              />
              <Box as="span" lineHeight="40px">
                =
              </Box>
              {secretValueElement()}
            </Box>
            {secret.isShared ? (
              <Box width="88px" display="flex" alignItems="center" justifyContent="center">
                <Toggletip
                  trigger="hover"
                  label="Shared resources are managed at Workspace settings."
                  learnMoreUrl="https://docs.bitrise.io/en/bitrise-ci/getting-started/migrating-to-bitrise/migrating-from-jenkins-to-bitrise.html#environment-variables-and-secrets-on-bitrise-94446"
                  button={{ href: secretSettingsUrl, label: 'Go to settings' }}
                >
                  <BitkitBadge>Shared</BitkitBadge>
                </Toggletip>
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
                        setIsShown(true);
                        onEdit?.(secret.key);
                      }}
                      marginLeft="8"
                    />
                    <IconButton
                      size="md"
                      iconSize="24"
                      iconName="MinusCircle"
                      aria-label="Delete secret"
                      variant="tertiary"
                      isDanger
                      onClick={() => onDelete(secret.key)}
                    />
                  </Box>
                )}
              </>
            )}
          </Box>
          {!secret.isEditing && (
            <Text color="text/secondary">
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
            <Box display="flex" flexDirection="column" marginBlock="16" gap="16">
              <Controller
                control={control}
                name="isExpand"
                render={({ field }) => (
                  <BitkitCheckbox
                    labelText="Replace variables in inputs"
                    helperText="Enable this if you want to replace Env Vars in your input with the assigned value."
                    checked={!!field.value}
                    name={field.name}
                    state={secret.isProtected ? 'readOnly' : undefined}
                    onCheckedChange={({ checked }) => field.onChange(checked === true)}
                  />
                )}
              />
              <Controller
                control={control}
                name="isExpose"
                render={({ field }) => (
                  <BitkitCheckbox
                    labelText="Expose for pull requests"
                    helperText="Be careful, this is a potential security risk."
                    checked={!!field.value}
                    name={field.name}
                    state={secret.isProtected ? 'readOnly' : undefined}
                    onCheckedChange={({ checked }) => field.onChange(checked === true)}
                  />
                )}
              />
              <Controller
                control={control}
                name="isProtected"
                render={({ field }) => (
                  <BitkitCheckbox
                    labelText="Protected"
                    helperText="Value cannot be revealed or changed. Irreversible once saved. Delete to replace."
                    checked={!!field.value}
                    name={field.name}
                    state={secret.isProtected ? 'readOnly' : undefined}
                    onCheckedChange={({ checked }) => field.onChange(checked === true)}
                  />
                )}
              />
              {saveError && <BitkitAlert variant="critical" messageText="Error while updating secret!" />}
              <Box display="flex" justifyContent="space-between">
                <Box display="flex" gap="16">
                  <BitkitButton
                    type="submit"
                    size="md"
                    state={saveLoading ? 'loading' : !watch('key') || !watch('value') ? 'disabled' : undefined}
                  >
                    Save
                  </BitkitButton>
                  <BitkitButton onClick={onCancelClick} size="md" variant="secondary">
                    Cancel
                  </BitkitButton>
                </Box>
                <BitkitButton size="md" variant="danger-secondary" onClick={() => onDelete(secret.key)}>
                  Delete secret
                </BitkitButton>
              </Box>
            </Box>
          )}
        </Box>
      </Card.Body>

      <Dialog title="Save and protect Secret permanently?" maxWidth="640" isOpen={!!confirmCallback} onClose={() => {}}>
        <DialogBody>
          <Text>
            Making a Secret protected is irreversible. <br />
            To change the value, you will need to delete this Secret Environment Variable and create a new one.
          </Text>
        </DialogBody>
        <DialogFooter>
          <BitkitButton
            variant="secondary"
            onClick={() => {
              setValue('isProtected', false);
              setConfirmCallback(undefined);
            }}
          >
            Cancel
          </BitkitButton>
          <BitkitButton
            variant="danger-primary"
            state={saveLoading ? 'loading' : undefined}
            onClick={() => {
              confirmCallback?.();
              setConfirmCallback(undefined);
            }}
          >
            Save and protect
          </BitkitButton>
        </DialogFooter>
      </Dialog>
    </Card.Root>
  );
};

export default SecretCard;
