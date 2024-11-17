import { useCallback, useEffect, useState } from 'react';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { useWorkflowConfigContext } from '../WorkflowConfig.context';

const useRenameWorkflow = (onChange?: (newWorkflowId: string) => void) => {
  const { id: currentWorkflowId } = useWorkflowConfigContext() ?? { id: '' };

  const [isRenaming, setIsRenaming] = useState(false);
  const [previousWorkflowId, setPreviousWorkflowId] = useState(currentWorkflowId);

  const { createWorkflow, renameWorkflow, deleteWorkflow } = useBitriseYmlStore((s) => ({
    createWorkflow: s.createWorkflow,
    renameWorkflow: s.renameWorkflow,
    deleteWorkflow: s.deleteWorkflow,
  }));

  const renameCallback = useCallback(
    (newWorkflowId: string) => {
      setIsRenaming(true);
      renameWorkflow(currentWorkflowId, newWorkflowId);
      createWorkflow(currentWorkflowId, newWorkflowId);
      setPreviousWorkflowId(currentWorkflowId);

      onChange?.(newWorkflowId);
    },
    [onChange, createWorkflow, renameWorkflow, currentWorkflowId],
  );

  useEffect(() => {
    if (isRenaming && previousWorkflowId && currentWorkflowId && previousWorkflowId !== currentWorkflowId) {
      setIsRenaming(false);
      deleteWorkflow(previousWorkflowId);
      setPreviousWorkflowId(currentWorkflowId);
    }
  }, [isRenaming, currentWorkflowId, previousWorkflowId, deleteWorkflow]);

  return renameCallback;
};

export default useRenameWorkflow;
