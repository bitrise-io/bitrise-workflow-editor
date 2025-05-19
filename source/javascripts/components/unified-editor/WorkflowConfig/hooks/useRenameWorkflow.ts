import { useCallback, useEffect, useState } from 'react';

import WorkflowService from '@/core/services/WorkflowService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

import { useWorkflowConfigContext } from '../WorkflowConfig.context';

const useRenameWorkflow = (onChange?: (newWorkflowId: string) => void) => {
  const selectedWorkflowId = useWorkflowConfigContext((s) => s?.id || '');
  const workflowIdsInTheStore = useBitriseYmlStore((s) => Object.keys(s.yml.workflows ?? {}));

  const [isRenaming, setIsRenaming] = useState(false);
  const [nextWorkflowId, setNextWorkflowId] = useState(selectedWorkflowId);
  const [prevWorkflowId, setPrevWorkflowId] = useState(selectedWorkflowId);

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
    console.log('shouldFinishRenaming', shouldFinishRenaming, prevWorkflowId);
    if (shouldFinishRenaming) {
      setIsRenaming(false);
      WorkflowService.deleteWorkflow(prevWorkflowId);
    }
  }, [shouldFinishRenaming, prevWorkflowId]);

  return useCallback(
    (newWorkflowId: string) => {
      if (selectedWorkflowId) {
        setIsRenaming(true);

        WorkflowService.renameWorkflow(selectedWorkflowId, newWorkflowId);
        WorkflowService.createWorkflow(selectedWorkflowId, newWorkflowId);

        setNextWorkflowId(newWorkflowId);
        console.log('setNextWorkflowId', newWorkflowId);
        setPrevWorkflowId(selectedWorkflowId);
        console.log('setPrevWorkflowId', selectedWorkflowId);
      }
    },
    [selectedWorkflowId],
  );
};

export default useRenameWorkflow;
