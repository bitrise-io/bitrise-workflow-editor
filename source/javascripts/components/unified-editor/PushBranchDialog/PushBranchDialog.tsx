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
  useDisclosure,
  useToast,
} from '@bitrise/bitkit';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import UpdateConfigurationDialog from '@/components/unified-editor/UpdateConfigurationDialog/UpdateConfigurationDialog';
import BranchesApi from '@/core/api/BranchesApi';
import { getYmlString } from '@/core/stores/BitriseYmlStore';
import PageProps from '@/core/utils/PageProps';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

type FormValues = {
  branch: string;
  message: string;
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

const PushBranchDialog = (props: Omit<DialogProps, 'title'>) => {
  const { isOpen, onClose } = props;
  const [branchType, setBranchType] = useState<'current' | 'new'>('current');
  const configBranch = useBitriseYmlStore((s) => s.configBranch);
  const configCommitSha = useBitriseYmlStore((s) => s.configCommitSha);

  const {
    isOpen: isUpdateConfigDialogOpen,
    onOpen: openUpdateConfigDialog,
    onClose: closeUpdateConfigDialog,
  } = useDisclosure();

  const toast = useToast();

  const defaultValues: FormValues = useMemo(
    () => ({
      branch: configBranch ?? '',
      message: '',
    }),
    [configBranch],
  );

  const { control, formState, handleSubmit, reset } = useForm<FormValues>({
    defaultValues,
    mode: 'onChange',
  });

  const {
    mutate: pushBranch,
    error: pushError,
    isPending: isPushPending,
  } = useMutation({
    mutationFn: ({ branch, message }: FormValues) =>
      BranchesApi.pushBranch({
        appSlug: PageProps.appSlug(),
        branch,
        sourceBranch: configBranch ?? '',
        commitSha: configCommitSha ?? '',
        bitriseYml: getYmlString(),
        message,
      }),
    onSuccess: (data) => {
      onClose();
      reset(defaultValues);
      toast({
        title: 'Changes pushed successfully',
        description: 'Continue in your git provider and open a pull request.',
        status: 'success',
        isClosable: true,
        action: data?.pr_url ? { label: 'Open PR', href: data.pr_url, target: '_blank' } : undefined,
      });
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
    <>
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
            rules={{
              validate: branchType === 'new' ? validateBranchName : undefined,
            }}
            render={({ field, fieldState }) => (
              <Input
                label="Target branch"
                placeholder="new-branch-name"
                helperText="Must follow git branch naming rules."
                isRequired
                isReadOnly={branchType === 'current'}
                errorText={fieldState.error?.message}
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
          {pushError && (
            <Notification status="error">
              The main branch is protected, changes can&apos;t be pushed directly. Use Manual update.
            </Notification>
          )}
          <Button
            variant="tertiary"
            onClick={() => {
              onClose();
              openUpdateConfigDialog();
            }}
            mr="auto"
            isDisabled={isPushPending}
          >
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
      <UpdateConfigurationDialog isOpen={isUpdateConfigDialogOpen} onClose={closeUpdateConfigDialog} />
    </>
  );
};

export default PushBranchDialog;
