import { useCallback, useEffect, useState } from 'react';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { useWorkflowConfigContext } from '../WorkflowConfig.context';

const useRenameWorkflow = (onChange?: (newWorkflowId: string) => void) => {
  const selectedWorkflowId = useWorkflowConfigContext()?.id ?? '';
  const workflowIdsInTheStore = useBitriseYmlStore((s) => Object.keys(s.yml.workflows ?? {}));

  const [isRenaming, setIsRenaming] = useState(false);
  const [nextWorkflowId, setNextWorkflowId] = useState(selectedWorkflowId);
  const [prevWorkflowId, setPrevWorkflowId] = useState(selectedWorkflowId);

  const { createWorkflow, renameWorkflow, deleteWorkflow } = useBitriseYmlStore((s) => ({
    createWorkflow: s.createWorkflow,
    renameWorkflow: s.renameWorkflow,
    deleteWorkflow: s.deleteWorkflow,
  }));

  const isNewWorkflowPersisted = workflowIdsInTheStore.includes(nextWorkflowId);
  const isNewWorkflowSelected = nextWorkflowId === selectedWorkflowId;

  const shouldRunOnChange = isRenaming && isNewWorkflowPersisted && !isNewWorkflowSelected;
  const shouldFinishRenaming = isRenaming && isNewWorkflowPersisted && isNewWorkflowSelected;

  useEffect(() => {
    if (shouldRunOnChange) {
      onChange?.(nextWorkflowId);
    }
  }, [onChange, shouldRunOnChange, nextWorkflowId]);

  useEffect(() => {
    if (shouldFinishRenaming) {
      setIsRenaming(false);
      deleteWorkflow(prevWorkflowId);
    }
  }, [deleteWorkflow, shouldFinishRenaming, prevWorkflowId]);

  return useCallback(
    (newWorkflowId: string) => {
      if (selectedWorkflowId) {
        setIsRenaming(true);

        renameWorkflow(selectedWorkflowId, newWorkflowId);
        createWorkflow(selectedWorkflowId, newWorkflowId);

        setNextWorkflowId(newWorkflowId);
        setPrevWorkflowId(selectedWorkflowId);
      }
    },
    [createWorkflow, renameWorkflow, selectedWorkflowId],
  );
};

export default useRenameWorkflow;
