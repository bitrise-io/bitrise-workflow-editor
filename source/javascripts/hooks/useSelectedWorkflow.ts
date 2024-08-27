import { useMemo } from 'react';
import useSearchParams from '@/hooks/useSearchParams';
import { Workflow, WorkflowYmlObject } from '@/core/models/Workflow';
import { useWorkflows } from '@/hooks/useWorkflows';

type UseSelectedWorkflowResult = [
  selectedWorkflow: Workflow,
  setSelectedWorkflow: (workflowId?: string | null) => void,
];

const useSelectedWorkflow = (): UseSelectedWorkflowResult => {
  const workflows = useWorkflows();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedWorkflowId = searchParams.workflow_id;

  return useMemo(() => {
    const workflowIds = Object.keys(workflows);
    const workflowEntries = Object.entries(workflows);

    const selectedWorkflow = (workflowEntries.find(([id]) => id === selectedWorkflowId) ??
      workflows[0]) as WorkflowYmlObject;

    const setSelectedWorkflow = (workflowId?: string | null) => {
      setSearchParams((oldSearchParams) => {
        return {
          ...oldSearchParams,
          workflow_id: workflowId && workflowIds.includes(workflowId) ? workflowId : workflowIds[0],
        };
      });
    };

    return [{ id: selectedWorkflowId, userValues: selectedWorkflow }, setSelectedWorkflow];
  }, [selectedWorkflowId, setSearchParams, workflows]);
};

export default useSelectedWorkflow;
