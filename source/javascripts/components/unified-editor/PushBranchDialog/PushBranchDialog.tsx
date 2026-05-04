import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogProps,
  Input,
  Radio,
  RadioGroup,
  Textarea,
} from '@bitrise/bitkit';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import BranchesApi from '@/core/api/BranchesApi';
import { getYmlString } from '@/core/stores/BitriseYmlStore';
import PageProps from '@/core/utils/PageProps';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

type FormValues = {
  branch: string;
  message: string;
};

const PushBranchDialog = (props: Omit<DialogProps, 'title'>) => {
  const { isOpen, onClose } = props;
  const [branchType, setBranchType] = useState<'current' | 'new'>('current');
  const configBranch = useBitriseYmlStore((s) => s.configBranch);
  const configCommitSha = useBitriseYmlStore((s) => s.configCommitSha);

  const defaultValues: FormValues = useMemo(
    () => ({
      branch: configBranch ?? '',
      message: '',
    }),
    [configBranch],
  );

  const { control, formState, handleSubmit, reset } = useForm<FormValues>({
    defaultValues,
  });

  const { mutate: pushBranch, isPending: isPushPending } = useMutation({
    mutationFn: ({ branch, message }: FormValues) =>
      BranchesApi.pushBranch({
        appSlug: PageProps.appSlug(),
        branch,
        sourceBranch: configBranch ?? '',
        commitSha: configCommitSha ?? '',
        bitriseYml: getYmlString(),
        message,
      }),
    onSuccess: () => {
      onClose();
      reset(defaultValues);
    },
  });

  const onSubmit = (data: FormValues) => {
    pushBranch(data);
  };

  useEffect(() => {
    if (isOpen) {
      reset(defaultValues);
      setBranchType('current');
    }
  }, [isOpen, reset, defaultValues]);

  return (
    <Dialog title="Push changes" isOpen={isOpen} onClose={onClose} as="form" onSubmit={handleSubmit(onSubmit)}>
      <DialogBody>
        <RadioGroup
          display="flex"
          gap="24"
          value={branchType}
          onChange={(value) => setBranchType(value as 'current' | 'new')}
        >
          <Radio value="current">Push to current branch</Radio>
          <Radio value="new">Create new branch</Radio>
        </RadioGroup>
        <Controller
          control={control}
          name="branch"
          render={({ field }) => (
            <Input
              label="Target branch"
              placeholder="new-branch-name"
              helperText="Must follow git branch naming rules."
              isRequired
              isReadOnly={branchType === 'current'}
              mt="24"
              {...field}
            />
          )}
        />
        <Controller
          control={control}
          name="message"
          render={({ field }) => (
            <Textarea
              label="Commit message"
              placeholder="e.g. Update Bitrise configuration via Workflow Editor"
              helperText="Appears in your git commit history."
              isRequired
              mt="24"
              {...field}
            />
          )}
        />
      </DialogBody>
      <DialogFooter>
        <Button variant="tertiary" mr="auto" isDisabled={isPushPending}>
          Manual update
        </Button>
        <Button variant="secondary" onClick={onClose} isDisabled={isPushPending}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isPushPending} isDisabled={!formState.isDirty || !formState.isValid}>
          Push changes
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default PushBranchDialog;
