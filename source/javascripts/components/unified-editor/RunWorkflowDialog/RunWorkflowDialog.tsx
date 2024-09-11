import { useState } from 'react';
import { Button, Dialog, DialogBody, DialogFooter, Input, useToast } from '@bitrise/bitkit';
import { DialogProps } from '@bitrise/bitkit/src/Components/Dialog/Dialog';
import WindowUtils from '@/core/utils/WindowUtils';
import useStartBuild from './useStartBuild';

type RunWorkflowDialogProps = Pick<DialogProps, 'isOpen' | 'onClose'> & {
  workflowId: string;
};

const RunWorkflowDialog = ({ isOpen, onClose, workflowId }: RunWorkflowDialogProps) => {
  const [branch, setBranch] = useState(WindowUtils.pageProps()?.project?.defaultBranch || '');
  const toast = useToast();
  const { mutate: startBuild } = useStartBuild();

  const handleAction = () => {
    if (!branch) {
      return;
    }
    startBuild(
      { workflowId, branch },
      {
        onSuccess: (data) => {
          if (data.build_url) {
            onClose();
            window.open(data.build_url, '_blank');
          }
        },
        onError: (error) => {
          toast({
            status: 'error',
            title: 'Failed to start build',
            description: error.message,
          });
        },
      },
    );
  };

  return (
    <Dialog
      title={`Run "${workflowId}"`}
      isOpen={isOpen}
      onClose={onClose}
      onCloseComplete={() => setBranch(WindowUtils.pageProps()?.project?.defaultBranch || '')}
    >
      <DialogBody>
        <Input
          isRequired
          label="Branch"
          placeholder="your-branch"
          type="text"
          autoComplete="on"
          value={branch}
          onChange={(event) => setBranch(event.target.value)}
        />
      </DialogBody>
      <DialogFooter>
        <Button variant="secondary" aria-label="Cancel" onClick={onClose}>
          Cancel
        </Button>
        <Button aria-label="Run Workflow" rightIconName="OpenInBrowser" isDisabled={!branch} onClick={handleAction}>
          Run Workflow
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default RunWorkflowDialog;
