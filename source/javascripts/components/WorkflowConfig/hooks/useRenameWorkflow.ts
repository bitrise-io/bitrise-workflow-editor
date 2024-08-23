import { useCallback, useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useSelectedWorkflow from '@/pages/WorkflowsPage/hooks/useSelectedWorkflow';
import { useWorkflowConfigContext } from '../WorkflowConfig.context';

const useRenameWorkflow = () => {
  const { id } = useWorkflowConfigContext();
  const [, setSelectedWorkflow] = useSelectedWorkflow();

  const currentWorkflowIdRef = useRef<string>(id);
  const removableWorkflowIdsRef = useRef<string[]>([]);

  const { workflows, renameWorkflow, createWorkflow, deleteWorkflow } = useBitriseYmlStore(
    useShallow((s) => {
      return {
        workflows: s.yml.workflows ?? {},
        renameWorkflow: s.renameWorkflow,
        createWorkflow: s.createWorkflow,
        deleteWorkflow: s.deleteWorkflow,
      };
    }),
  );

  useEffect(() => {
    const isNewWorkflowExists = Object.keys(workflows).includes(currentWorkflowIdRef.current);

    if (isNewWorkflowExists) {
      if (id !== currentWorkflowIdRef.current) {
        // setSelectedWorkflow(currentWorkflowIdRef.current);
      } else {
        removableWorkflowIdsRef.current.forEach(deleteWorkflow);
        removableWorkflowIdsRef.current = [];
      }
    }
  }, [deleteWorkflow, setSelectedWorkflow, workflows, id]);

  return useCallback(
    (newWorkflowId: string) => {
      if (newWorkflowId !== currentWorkflowIdRef.current) {
        removableWorkflowIdsRef.current.push(currentWorkflowIdRef.current);
        renameWorkflow(currentWorkflowIdRef.current, newWorkflowId);
        createWorkflow(currentWorkflowIdRef.current, newWorkflowId);
        currentWorkflowIdRef.current = newWorkflowId;
      }
    },
    [createWorkflow, renameWorkflow],
  );
};

export default useRenameWorkflow;
