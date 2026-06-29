import {
  BitkitAlert,
  BitkitButton,
  BitkitFormDialog,
  BitkitRadio,
  BitkitRadioGroup,
  BitkitTextArea,
  BitkitTextInput,
} from '@bitrise/bitkit-v2';
import { useEffect, useMemo } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';

import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { PushBranchPayload } from '@/hooks/usePushBranch';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  isPushPending?: boolean;
  pushError?: string;
  onPush: (values: PushBranchPayload) => void;
  onManualUpdate: () => void;
};

const GIT_BRANCH_INVALID_CHARS = /[ ~^:?*[\]\\]|[\u007f]/u;
const GIT_BRANCH_INVALID_SEQUENCES = /\.\.|@\{|\/\//;
const GIT_BRANCH_INVALID_START = /^[./]/;
const GIT_BRANCH_INVALID_END = /[./]$|\.lock$/;

function validateBranchName(branch: string): string | true {
  if (
    GIT_BRANCH_INVALID_CHARS.test(branch) ||
    GIT_BRANCH_INVALID_SEQUENCES.test(branch) ||
    GIT_BRANCH_INVALID_START.test(branch) ||
    GIT_BRANCH_INVALID_END.test(branch)
  ) {
    return 'Invalid branch name. Must follow git branch naming rules.';
  }
  return true;
}

const PushBranchDialog = ({ isOpen, onClose, isPushPending, pushError, onPush, onManualUpdate }: Props) => {
  const configBranch = useBitriseYmlStore((s) => s.configBranch);

  const defaultValues: PushBranchPayload = useMemo(
    () => ({
      branch: configBranch ?? '',
      message: 'Update bitrise.yml via Workflow Editor',
    }),
    [configBranch],
  );

  const { control, formState, handleSubmit, reset } = useForm<PushBranchPayload>({
    defaultValues,
    mode: 'onChange',
  });

  const branchValue = useWatch({ control, name: 'branch' });
  const isCurrentBranch = branchValue === (configBranch ?? '');

  useEffect(() => {
    if (isOpen) {
      reset(defaultValues);
    }
  }, [isOpen, reset, defaultValues]);

  return (
    <BitkitFormDialog
      title="Push changes"
      open={isOpen}
      onOpenChange={({ open }) => {
        if (!open) onClose();
      }}
      onSubmit={handleSubmit(onPush)}
      footerButtons={
        <>
          <BitkitButton
            variant="tertiary"
            onClick={() => {
              onClose();
              onManualUpdate();
            }}
            marginInlineEnd="auto"
            state={isPushPending ? 'disabled' : undefined}
          >
            Manual update
          </BitkitButton>
          <BitkitButton variant="secondary" onClick={onClose} state={isPushPending ? 'disabled' : undefined}>
            Cancel
          </BitkitButton>
          <BitkitButton type="submit" state={isPushPending ? 'loading' : !formState.isValid ? 'disabled' : undefined}>
            Push changes
          </BitkitButton>
        </>
      }
    >
      <BitkitRadioGroup
        aria-label="Target branch"
        layout="horizontal"
        value={isCurrentBranch ? 'current' : 'new'}
        onValueChange={({ value }) => {
          const newBranch = value === 'current' ? (configBranch ?? '') : '';
          reset(
            { branch: newBranch, message: formState.defaultValues?.message ?? defaultValues.message },
            { keepErrors: false },
          );
        }}
      >
        <BitkitRadio value="current" labelText="Push to current branch" />
        <BitkitRadio value="new" labelText="Create new branch" />
      </BitkitRadioGroup>
      <Controller
        control={control}
        name="branch"
        rules={{
          required: 'Branch name is required',
          validate: !isCurrentBranch ? validateBranchName : undefined,
        }}
        render={({ field, fieldState }) => (
          <BitkitTextInput
            label="Target branch"
            placeholder="new-branch-name"
            helperText="Must follow git branch naming rules."
            state={isCurrentBranch ? 'readOnly' : undefined}
            errorText={fieldState.error?.message}
            inputProps={field}
          />
        )}
      />
      <Controller
        control={control}
        name="message"
        rules={{ required: 'Commit message is required' }}
        render={({ field }) => (
          <BitkitTextArea
            label="Commit message"
            placeholder="e.g. Update bitrise.yml via Workflow Editor"
            helperText="Appears in your git commit history."
            textareaProps={field}
          />
        )}
      />
      {pushError && <BitkitAlert variant="critical" messageText={pushError} />}
    </BitkitFormDialog>
  );
};

export default PushBranchDialog;
