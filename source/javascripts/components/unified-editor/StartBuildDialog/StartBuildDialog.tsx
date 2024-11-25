import { useCallback, useState } from 'react';
import { Button, Dialog, DialogBody, DialogFooter, Input, useToast } from '@bitrise/bitkit';
import { DialogProps } from '@bitrise/bitkit/src/Components/Dialog/Dialog';
import WindowUtils from '@/core/utils/WindowUtils';
import useStartBuild from './useStartBuild';

type RunWorkflowDialogProps = Omit<DialogProps, 'title'> & {
  pipelineId?: string;
  workflowId?: string;
};

const StartBuildDialog = ({ pipelineId, workflowId, ...dialogProps }: RunWorkflowDialogProps) => {
  const [branch, setBranch] = useState(WindowUtils.pageProps()?.project?.defaultBranch || '');
  const toast = useToast();
  const { mutate: startBuild, isPending } = useStartBuild();

  const { onClose, onCloseComplete } = dialogProps;

  const handleOnCloseComplete = useCallback(() => {
    setBranch(WindowUtils.pageProps()?.project?.defaultBranch || '');
    onCloseComplete?.();
  }, [onCloseComplete]);

  const handleAction = () => {
    if (!branch) {
      return;
    }
    startBuild(
      { pipelineId, workflowId, branch },
      {
        onSuccess: (data) => {
          onClose();
          if (data?.build_url) {
            window.open(data?.build_url, '_blank');
          }
        },
        onError: async (error) => {
          toast({
            status: 'error',
            title: 'Failed to start build',
            description: error.response ? (await error.response.json()).message : error.message,
          });
        },
      },
    );
  };

  return (
    <Dialog title={`Run "${pipelineId || workflowId}"`} {...dialogProps} onCloseComplete={handleOnCloseComplete}>
      <DialogBody>
        <Input
          autoFocus
          isRequired
          label="Branch"
          placeholder="your-branch"
          isDisabled={isPending}
          inputRef={(ref) => ref?.setAttribute('data-1p-ignore', '')}
          value={branch}
          onChange={(event) => setBranch(event.target.value)}
        />
      </DialogBody>
      <DialogFooter>
        <Button variant="secondary" aria-label="Cancel" isDisabled={isPending} onClick={onClose}>
          Cancel
        </Button>
        <Button
          aria-label="Start build"
          rightIconName="OpenInBrowser"
          isDisabled={!branch}
          isLoading={isPending}
          onClick={handleAction}
        >
          Start build
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default StartBuildDialog;
