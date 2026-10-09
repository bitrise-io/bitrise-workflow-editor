import { Button, Dialog, DialogBody, DialogFooter, DialogProps, Input } from '@bitrise/bitkit';
import { createBitkitToast } from '@bitrise/bitkit-v2';
import { useCallback, useState } from 'react';

import PageProps from '@/core/utils/PageProps';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

import useStartBuild from './useStartBuild';

type RunWorkflowDialogProps = Omit<DialogProps, 'title'> & {
  pipelineId?: string;
  workflowId?: string;
};

const StartBuildDialog = ({ pipelineId, workflowId, ...dialogProps }: RunWorkflowDialogProps) => {
  const configBranch = useBitriseYmlStore((s) => s.configBranch);
  const initialBranch = configBranch || PageProps.app()?.defaultBranch || '';
  const [branch, setBranch] = useState(initialBranch);
  const { mutate: startBuild, isPending } = useStartBuild();

  const { onClose, onCloseComplete } = dialogProps;

  const handleOnCloseComplete = useCallback(() => {
    setBranch(initialBranch);
    onCloseComplete?.();
  }, [initialBranch, onCloseComplete]);

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
          createBitkitToast({
            variant: 'critical',
            titleText: 'Failed to start build',
            messageText: error.response ? (await error.response.json()).message : error.message,
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
