import { Checkbox, Dialog, DialogBody, DialogFooter, Icon, IconButton, Input, Text, Toggletip } from '@bitrise/bitkit';
import {
  BitkitAlert,
  BitkitBadge,
  BitkitButton,
  BitkitControlButton,
  IconMinusCircle,
  IconPencil,
} from '@bitrise/bitkit-v2';
import { Box, BoxProps } from '@chakra-ui/react/box';
import { Skeleton } from '@chakra-ui/react/skeleton';
import { JSX, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import AutoGrowableInput from '@/components/AutoGrowableInput';
import { Secret } from '@/core/models/Secret';
import { useSecretValue, useUpsertSecret } from '@/hooks/useSecrets';

// The Secrets tables share the Env Vars table's shape: key, "=", value, then the row's actions. A table where
// no row has actions (e.g. only a new Secret being added) drops that column, so key and value fill the width.
export const secretRowGrid = (hasActionsColumn: boolean): BoxProps => ({
  display: 'grid',
  gridTemplateColumns: hasActionsColumn
    ? 'minmax(0, 1fr) auto minmax(0, 1fr) 88px'
    : 'minmax(0, 1fr) auto minmax(0, 1fr)',
  columnGap: '8',
  paddingInlineStart: '32',
  paddingInlineEnd: '16',
});

// Whether a Secret's row shows any action: the Shared badge, Edit / Remove, or Remove while editing a saved one.
export const hasRowActions = (secret: Secret) => Boolean(secret.isShared || !secret.isEditing || secret.isSaved);

interface SecretCardProps {
  appSlug: string;
  secret: Secret;
  onEdit: (id: string) => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
  onSave: (secret: Secret) => void;
  isKeyUsed: (key: string) => boolean;
  secretSettingsUrl?: string;
  hasActionsColumn: boolean;
}

// One Secret as a row of the Secrets table, like an Env Var row. It edits in place: the value grows, and the
// options and Save / Cancel open under it.
const SecretCard = (props: SecretCardProps) => {
  const { onEdit, onCancel, onSave, onDelete, secret, appSlug, isKeyUsed, secretSettingsUrl, hasActionsColumn } = props;

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

  const protectedIcon = <Icon size="16" name="Lock" color="icon/tertiary" margin="12" />;

  const showHideButton = (
    <IconButton
      size="md"
      variant="secondary"
      borderLeftRadius={0}
      aria-label={isShown ? 'Hide' : 'Show'}
      iconName={isShown ? 'HidePassword' : 'ShowPassword'}
      onClick={() => (isShown ? setIsShown(false) : setIsShown(true))}
    />
  );

  let valueInputAddon: JSX.Element | undefined;

  if (!secret.isEditing) {
    if (secret.isProtected) {
      valueInputAddon = protectedIcon;
    } else if (!secret.isShared) {
      valueInputAddon = showHideButton;
    }
  }

  const secretValueElement = () => {
    if (isSecretValueLoading) {
      return <Skeleton height="40" borderRadius="4" />;
    }
    if (secret.isEditing) {
      register('value', { required: 'This field is required.' });
      return (
        <AutoGrowableInput
          value={watch('value') || ''}
          aria-label="Value"
          placeholder="Enter value"
          errorText={errors?.value?.message}
          onChange={(e) => setValue('value', e.target.value, { shouldDirty: true, shouldValidate: true })}
        />
      );
    }
    return (
      <Input
        size="md"
        isReadOnly
        aria-label="Value"
        sx={{
          '& input': {
            pointerEvents: 'none',
          },
        }}
        cursor="not-allowed"
        type={isShown ? 'text' : 'password'}
        rightAddon={valueInputAddon}
        rightAddonPlacement="inside"
        value={watch('value') || ''}
      />
    );
  };

  const flags = [
    secret.isExpand ? 'Replace variables in inputs' : '',
    secret.isExpose ? 'Exposed for pull requests' : '',
    secret.isProtected ? 'Protected' : '',
  ].filter(Boolean);

  const optionStyle = secret.isProtected ? { opacity: 0.4, pointerEvents: 'none' as const } : {};

  const actions = () => {
    if (secret.isShared) {
      return (
        <Toggletip
          trigger="hover"
          label="Shared resources are managed at Workspace settings."
          learnMoreUrl="https://docs.bitrise.io/en/bitrise-ci/getting-started/migrating-to-bitrise/migrating-from-jenkins-to-bitrise.html#environment-variables-and-secrets-on-bitrise-94446"
          button={{ href: secretSettingsUrl, label: 'Go to settings' }}
        >
          <BitkitBadge>Shared</BitkitBadge>
        </Toggletip>
      );
    }
    if (secret.isEditing) {
      // A new, unsaved Secret has nothing to remove yet; Cancel discards it.
      if (!secret.isSaved) {
        return null;
      }
      return (
        <BitkitControlButton
          isDanger
          size="md"
          icon={IconMinusCircle}
          label="Remove"
          onClick={() => onDelete(secret.key)}
        />
      );
    }
    return (
      <>
        <BitkitControlButton
          size="md"
          icon={IconPencil}
          label="Edit"
          onClick={() => {
            setIsShown(true);
            onEdit?.(secret.key);
          }}
        />
        <BitkitControlButton
          isDanger
          size="md"
          icon={IconMinusCircle}
          label="Remove"
          onClick={() => onDelete(secret.key)}
        />
      </>
    );
  };

  return (
    <Box
      as="form"
      onSubmit={handleSubmit(onFormSubmit)}
      {...secretRowGrid(hasActionsColumn)}
      rowGap="12"
      paddingBlock="16"
      borderBottom="1px solid"
      borderColor="border/minimal"
      background="background/primary"
    >
      <Input
        size="md"
        aria-label="Key"
        leftIconName="Dollars"
        placeholder="Enter key"
        isReadOnly={secret.isSaved}
        errorText={errors?.key?.message}
        inputRef={(ref) => ref?.setAttribute('data-1p-ignore', '')}
        {...register('key', {
          validate: (v) => !isKeyUsed(v) || 'This key is already used!',
        })}
      />
      <Text color="text/tertiary" paddingBlockStart="8">
        =
      </Text>
      {secretValueElement()}
      {hasActionsColumn && (
        <Box display="flex" justifyContent="flex-end" alignItems="center" gap="4" minHeight="40" alignSelf="start">
          {actions()}
        </Box>
      )}

      {!secret.isEditing && flags.length > 0 && (
        <Text gridColumn="1 / 4" textStyle="body/sm/regular" color="text/secondary">
          {flags.join(' • ')}
        </Text>
      )}

      {secret.isEditing && (
        <Box gridColumn="1 / 4" display="flex" flexDirection="column" gap="12" paddingBlockStart="4">
          <Checkbox
            isChecked={watch('isExpand')}
            {...register('isExpand')}
            isReadOnly={secret.isProtected}
            style={optionStyle}
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
            style={optionStyle}
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
            style={optionStyle}
          >
            <Box display="flex" flexDirection="column">
              <Text size="3">Protected</Text>
              <Text size="1" color="input/text/helper" casing="none">
                Value cannot be revealed or changed. Irreversible once saved. Delete to replace.
              </Text>
            </Box>
          </Checkbox>
          {saveError && <BitkitAlert variant="critical" messageText="Error while updating secret!" />}
          <Box display="flex" gap="8" paddingBlockStart="4">
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
        </Box>
      )}

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
    </Box>
  );
};

export default SecretCard;
