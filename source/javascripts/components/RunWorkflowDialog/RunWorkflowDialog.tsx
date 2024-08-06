import { useState } from 'react';
import { Button, Dialog, DialogBody, DialogFooter, Input } from '@bitrise/bitkit';
import { DialogProps } from '@bitrise/bitkit/src/Components/Dialog/Dialog';

type RunWorkflowDialogProps = Pick<DialogProps, 'isOpen' | 'onClose'> & {
  defaultBranch: string;
  workflow: string;
  onAction: (branch: string) => void;
};

const RunWorkflowDialog = ({ isOpen, onClose, defaultBranch, workflow, onAction }: RunWorkflowDialogProps) => {
  const [branch, setBranch] = useState(defaultBranch);

  const handleAction = () => {
    if (!branch) {
      return;
    }
    onAction(branch);
    onClose();
  };

  return (
    <Dialog title={`Run "${workflow}"`} isOpen={isOpen} onClose={onClose}>
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
