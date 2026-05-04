import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogProps,
  Input,
  Notification,
  Radio,
  RadioGroup,
  Textarea,
} from '@bitrise/bitkit';
import { useEffect, useMemo } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';

import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

export type PushBranchFormValues = {
  branch: string;
  message: string;
};

type Props = Omit<DialogProps, 'title'> & {
  isPushPending?: boolean;
  pushError?: string;
  onPush: (values: PushBranchFormValues) => void;
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

const PushBranchDialog = ({ isPushPending, pushError, onPush, onManualUpdate, ...props }: Props) => {
  const { isOpen, onClose } = props;
  const configBranch = useBitriseYmlStore((s) => s.configBranch);

  const defaultValues: PushBranchFormValues = useMemo(
    () => ({
      branch: configBranch ?? '',
      message: 'Update bitrise.yml via Workflow Editor',
    }),
    [configBranch],
  );

  const { control, formState, handleSubmit, reset } = useForm<PushBranchFormValues>({
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
    <Dialog title="Push changes" {...props} as="form" onSubmit={handleSubmit(onPush)}>
      <DialogBody>
        <RadioGroup
          display="flex"
          gap="24"
          value={isCurrentBranch ? 'current' : 'new'}
          onChange={(value) => {
            const newBranch = value === 'current' ? (configBranch ?? '') : '';
            reset(
              { branch: newBranch, message: formState.defaultValues?.message ?? defaultValues.message },
              { keepErrors: false },
            );
          }}
        >
          <Radio value="current">Push to current branch</Radio>
          <Radio value="new">Create new branch</Radio>
        </RadioGroup>
        <Controller
          control={control}
          name="branch"
          rules={{
            required: 'Branch name is required',
            validate: !isCurrentBranch ? validateBranchName : undefined,
          }}
          render={({ field, fieldState }) => (
            <Input
              label="Target branch"
              placeholder="new-branch-name"
              helperText="Must follow git branch naming rules."
              isRequired
              isReadOnly={isCurrentBranch}
              errorText={fieldState.error?.message}
              mt="24"
              {...field}
            />
          )}
        />
        <Controller
          control={control}
          name="message"
          rules={{ required: 'Commit message is required' }}
          render={({ field }) => (
            <Textarea
              label="Commit message"
              placeholder="e.g. Update bitrise.yml via Workflow Editor"
              helperText="Appears in your git commit history."
              isRequired
              mt="24"
              {...field}
            />
          )}
        />
      </DialogBody>
      <DialogFooter>
        {pushError && <Notification status="error">{pushError}</Notification>}
        <Button
          variant="tertiary"
          onClick={() => {
            onClose();
            onManualUpdate();
          }}
          mr="auto"
          isDisabled={isPushPending}
        >
          Manual update
        </Button>
        <Button variant="secondary" onClick={onClose} isDisabled={isPushPending}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isPushPending} isDisabled={!formState.isValid}>
          Push changes
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default PushBranchDialog;
