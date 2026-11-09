import { BitkitButton, BitkitDialog, BitkitTextInput, createBitkitToast, IconOpenInNew } from '@bitrise/bitkit-v2';
import { useCallback, useRef, useState } from 'react';

import PageProps from '@/core/utils/PageProps';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import ignore1Password from '@/utils/ignore1Password';

import useStartBuild from './useStartBuild';

type RunWorkflowDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onCloseComplete?: () => void;
  pipelineId?: string;
  workflowId?: string;
};

const StartBuildDialog = ({ isOpen, onClose, onCloseComplete, pipelineId, workflowId }: RunWorkflowDialogProps) => {
  const configBranch = useBitriseYmlStore((s) => s.configBranch);
  const initialBranch = configBranch || PageProps.app()?.defaultBranch || '';
  const [branch, setBranch] = useState(initialBranch);
  const { mutate: startBuild, isPending } = useStartBuild();
  const branchInputRef = useRef<HTMLInputElement>(null);

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
    <BitkitDialog
      title={`Run "${pipelineId || workflowId}"`}
      open={isOpen}
      onOpenChange={({ open }) => {
        if (!open) onClose();
      }}
      onExitComplete={handleOnCloseComplete}
      initialFocusEl={() => branchInputRef.current}
      state={isPending ? 'loading' : undefined}
      footerButtons={
        <>
          <BitkitButton variant="secondary" state={isPending ? 'disabled' : undefined} onClick={onClose}>
            Cancel
          </BitkitButton>
          <BitkitButton
            suffixIcon={IconOpenInNew}
            state={isPending ? 'loading' : !branch ? 'disabled' : undefined}
            onClick={handleAction}
          >
            Start build
          </BitkitButton>
        </>
      }
    >
      <BitkitTextInput
        label="Branch"
        placeholder="your-branch"
        state={isPending ? 'disabled' : undefined}
        inputRef={ignore1Password}
        inputProps={{ ref: branchInputRef }}
        value={branch}
        onValueChange={setBranch}
      />
    </BitkitDialog>
  );
};

export default StartBuildDialog;
