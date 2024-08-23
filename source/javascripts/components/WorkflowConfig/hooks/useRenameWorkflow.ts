import { useCallback, useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useDebounceCallback } from 'usehooks-ts';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useSelectedWorkflow from '@/pages/WorkflowsPage/hooks/useSelectedWorkflow';
import { useWorkflowConfigContext } from '../WorkflowConfig.context';

const useRenameWorkflow = () => {
  const { id } = useWorkflowConfigContext();
  const [, setSelectedWorkflow] = useSelectedWorkflow();
  const [{ newWorkflowId, oldWorkflowId }, setState] = useState({ newWorkflowId: '', oldWorkflowId: '' });

  const { workflows, createWorkflow, deleteWorkflow } = useBitriseYmlStore(
    useShallow((s) => {
      return {
        workflows: s.yml.workflows ?? {},
        createWorkflow: s.createWorkflow,
        deleteWorkflow: s.deleteWorkflow,
      };
    }),
  );

  const isOldWorkflowExists = useMemo(() => {
    return Object.keys(workflows).includes(oldWorkflowId);
  }, [workflows, oldWorkflowId]);

  const isNewWorkflowExists = useMemo(() => {
    return Object.keys(workflows).includes(newWorkflowId);
  }, [workflows, newWorkflowId]);

  const isNewWorkflowSelected = useMemo(() => {
    return id === newWorkflowId;
  }, [id, newWorkflowId]);

  useEffect(() => {
    if (isOldWorkflowExists && isNewWorkflowExists) {
      if (isNewWorkflowSelected) {
        deleteWorkflow(oldWorkflowId);
        setState({ oldWorkflowId: '', newWorkflowId: '' });
      } else {
        setSelectedWorkflow(newWorkflowId);
      }
    }
  }, [
    deleteWorkflow,
    isNewWorkflowExists,
    isNewWorkflowSelected,
    isOldWorkflowExists,
    newWorkflowId,
    oldWorkflowId,
    setSelectedWorkflow,
  ]);

  const renameWorkflow = useCallback(
    (value: string) => {
      if (!isNewWorkflowExists) {
        setState({ oldWorkflowId: id, newWorkflowId: value });
        createWorkflow(value, id);
      }
    },
    [createWorkflow, id, isNewWorkflowExists],
  );

  return useDebounceCallback(renameWorkflow, 150);
};

export default useRenameWorkflow;
