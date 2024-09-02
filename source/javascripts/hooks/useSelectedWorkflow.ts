import { useMemo } from 'react';
import useSearchParams from '@/hooks/useSearchParams';
import { Workflow } from '@/core/models/Workflow';
import { useWorkflows } from '@/hooks/useWorkflows';

function selectValidWorkflowId(workflowIds: string[], requestedId?: string | null): string {
  if (requestedId && workflowIds.includes(requestedId)) {
    return requestedId;
  }

  return workflowIds[0];
}

type UseSelectedWorkflowResult = [
  selectedWorkflow: Workflow,
  setSelectedWorkflow: (workflowId?: string | null) => void,
];

const useSelectedWorkflow = (): UseSelectedWorkflowResult => {
  const workflows = useWorkflows();
  const [searchParams, setSearchParams] = useSearchParams();

  return useMemo(() => {
    const workflowIds = Object.keys(workflows);
    const selectedWorkflowId = selectValidWorkflowId(workflowIds, searchParams.workflow_id);
    const selectedWorkflow = workflows[selectedWorkflowId];

    const setSelectedWorkflow = (workflowId?: string | null) => {
      setSearchParams((oldSearchParams) => {
        return {
          ...oldSearchParams,
          workflow_id: selectValidWorkflowId(workflowIds, workflowId),
        };
      });
    };

    return [{ id: selectedWorkflowId, userValues: selectedWorkflow }, setSelectedWorkflow];
  }, [searchParams, setSearchParams, workflows]);
};

export default useSelectedWorkflow;
