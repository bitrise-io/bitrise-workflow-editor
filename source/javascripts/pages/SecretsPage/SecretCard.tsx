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
  Notification,
  Skeleton,
  SkeletonBox,
  Text,
  Textarea,
  Toggletip,
} from '@bitrise/bitkit';

import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { useSecretValue, useUpdateSecret } from '@/hooks/useSecrets';
import { Secret } from '@/core/models/Secret';

interface SecretCardProps extends CardProps {
  appSlug: string;
  secret: Secret;
  onEdit: (id: string) => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
  onSave: (secret: Secret) => void;
  isKeyUsed: (key: string) => boolean;
  secretSettingsUrl?: string;
  writeSecrets: boolean;
}

const SecretCard = (props: SecretCardProps) => {
  const { onEdit, onCancel, onSave, onDelete, secret, appSlug, isKeyUsed, secretSettingsUrl, writeSecrets } = props;

  const [isShown, setIsShown] = useState(false);
  const [confirmCallback, setConfirmCallback] = useState<() => void | undefined>();

  const queryClient = useQueryClient();
  // NOTE why do we need to ask the API and Monolith for the same value?
  const {
    isLoading: isSecretValueLoadingOld,
    data: fetchedSecretValueOld,
    refetch: fetchSecretValue,
  } = useSecretValue({ appSlug, secretKey: secret.key, useApi: true });
  const { data: fetchedSecretNewValue, isFetching: isSecretValueLoadingNew } = useSecretValue({
    appSlug,
    secretKey: secret.key,
    useApi: false,
    options: { enabled: isShown && writeSecrets },
  });
  const fetchedSecretValue = fetchedSecretValueOld || fetchedSecretNewValue;
  const isSecretValueLoading = isSecretValueLoadingOld || isSecretValueLoadingNew;
  const {
    mutate: saveSecret,
    isError: saveError,
    isPending: saveLoading,
    reset: resetSave,
  } = useUpdateSecret({
    appSlug,
    options: {
      onSuccess(_, newSecret) {
        resetSave();
        onSave(newSecret);
        queryClient.invalidateQueries({
          queryKey: ['app', appSlug, 'secret', secret.key],
        });
      },
    },
  });

  const handleSave = (value: Secret) => {
    if (writeSecrets) {
      saveSecret(value);
    } else {
      onSave(value);
    }
  };

  const {
    register,
    watch,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Secret>({
    values: {
      ...secret,
      value: secret.isEditing || isShown ? fetchedSecretValue || secret.value : '••••••••',
    },
  });

  const showSecretValue = () => {
    setIsShown(true);

    if (secret.isSaved && !secret.isProtected && !writeSecrets) {
      fetchSecretValue();
    }
  };

  const hideSecretValue = () => {
    setIsShown(false);
  };

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
    handleSave(formData);
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

  let valueInputAddon: JSX.Element;

  if (!secret.isEditing) {
    if (secret.isProtected) {
      valueInputAddon = protectedIcon;
    } else if (!secret.isShared) {
      valueInputAddon = showHideButton;
    }
  }

  const secretValueElement = () => {
    if (isSecretValueLoading) {
      return (
        <Skeleton isActive height="40">
          <SkeletonBox width="100%" height="100%" borderRadius="4" />
        </Skeleton>
      );
    }
    if (secret.isEditing) {
      return (
        <Textarea
          sx={{
            '& textarea': {
              minHeight: '40',
              height: '40',
              paddingTop: '8',
              paddingX: '11px',
              fontSize: '2',
            },
          }}
          {...register('value', { required: 'This field is required.' })}
        />
      );
    }
    return (
      <Input
        size="md"
        isReadOnly
        sx={{
          '& input': {
            pointerEvents: 'none',
          },
        }}
        cursor="not-allowed"
        type={isShown ? 'text' : 'password'}
        rightAddon={valueInputAddon}
        rightAddonPlacement="inside"
        value={watch('value')}
      />
    );
  };

  return (
    <Card paddingY="16" paddingX="24" marginBottom="16">
      <Box as="form" onSubmit={handleSubmit(onFormSubmit)} width="100%" display="flex" gap="12" flexDir="column">
        <Box width="100%" display="flex" gap="8">
          <Box flexGrow="1" display="grid" gridTemplateColumns="1fr auto 1fr" gap="8" alignItems="start">
            <Input
              flexGrow={1}
              size="md"
              isReadOnly={secret.isSaved}
              errorText={errors?.key?.message}
              {...register('key', {
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
                learnMoreUrl="https://devcenter.bitrise.io/en/getting-started/migrating-to-bitrise/migrating-from-jenkins-to-bitrise.html#environment-variables-and-secrets-on-bitrise"
                button={{ href: secretSettingsUrl, label: 'Go to settings' }}
              >
                <Badge background="sys/neutral/subtle" color="text/secondary">
                  Shared
                </Badge>
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
                      showSecretValue();

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
            >
              <Box display="flex" flexDirection="column">
                <Text size="3">Protected</Text>
                <Text size="1" color="input/text/helper" casing="none">
                  Value cannot be revealed or changed. Irreversible once saved. Delete to replace.
                </Text>
              </Box>
            </Checkbox>
            {saveError && <Notification status="error">Error while updating secret!</Notification>}
            <Box display="flex" justifyContent="space-between">
              <Box display="flex" gap="16">
                <Button type="submit" size="md" isDisabled={!watch('key') || !watch('value')} isLoading={saveLoading}>
                  Save
                </Button>
                <Button onClick={onCancelClick} size="md" variant="secondary">
                  Cancel
                </Button>
              </Box>
              <Button size="md" variant="danger-secondary" onClick={() => onDelete(secret.key)}>
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
            isLoading={saveLoading}
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
