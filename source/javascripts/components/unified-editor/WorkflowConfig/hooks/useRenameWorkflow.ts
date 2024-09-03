import { useCallback, useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import uniq from 'lodash/uniq';
import { useDebounceCallback } from 'usehooks-ts';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { useWorkflowConfigContext } from '../WorkflowConfig.context';

const useRenameWorkflow = (onChange?: (newWorkflowId: string) => void) => {
  const { id: selectedWorkflowId } = useWorkflowConfigContext() ?? { id: '' };

  const oldWorkflowIdRef = useRef(selectedWorkflowId);
  const newWorkflowIdRef = useRef(selectedWorkflowId);
  const removableWorkflowIdsRef = useRef<string[]>([]);

  const workflows = useBitriseYmlStore(useShallow((s) => s.yml.workflows ?? {}));
  const { createWorkflow, renameWorkflow, deleteWorkflows } = useBitriseYmlStore(
    useShallow((s) => ({
      createWorkflow: s.createWorkflow,
      renameWorkflow: s.renameWorkflow,
      deleteWorkflows: s.deleteWorkflows,
    })),
  );

  useEffect(() => {
    newWorkflowIdRef.current = selectedWorkflowId;
  }, [selectedWorkflowId]);

  useEffect(() => {
    const isChanged = oldWorkflowIdRef.current !== newWorkflowIdRef.current;
    const isNewWorkflowExists = Object.keys(workflows).includes(newWorkflowIdRef.current);
    const isNewWorkflowSelected = selectedWorkflowId === newWorkflowIdRef.current;

    if (!isChanged || !isNewWorkflowExists) {
      return;
    }

    if (!isNewWorkflowSelected) {
      onChange?.(newWorkflowIdRef.current);
    }

    if (isNewWorkflowSelected) {
      oldWorkflowIdRef.current = newWorkflowIdRef.current;
      deleteWorkflows(removableWorkflowIdsRef.current);
      removableWorkflowIdsRef.current = [];
    }
  }, [deleteWorkflows, onChange, selectedWorkflowId, workflows]);

  const renameCallback = useCallback(
    (newWorkflowId: string) => {
      removableWorkflowIdsRef.current =
        newWorkflowIdRef.current === newWorkflowId
          ? removableWorkflowIdsRef.current
          : uniq([...removableWorkflowIdsRef.current, newWorkflowIdRef.current]);

      renameWorkflow(newWorkflowIdRef.current, newWorkflowId);
      createWorkflow(newWorkflowIdRef.current, newWorkflowId);

      newWorkflowIdRef.current = newWorkflowId;
    },
    [createWorkflow, renameWorkflow],
  );

  return useDebounceCallback(renameCallback, 250);
};

export default useRenameWorkflow;
