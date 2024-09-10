import { useEffect, useMemo } from 'react';
import { useToast } from '@bitrise/bitkit';
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
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const workflows = useWorkflows();
  const workflowIds = Object.keys(workflows);

  useEffect(() => {
    if (workflowIds.length === 0) {
      return;
    }

    if (searchParams.workflow_id && !workflowIds.includes(searchParams.workflow_id)) {
      toast({
        status: 'warning',
        title: `Workflow ${searchParams.workflow_id} not found`,
        description: 'Showing the first workflow instead.',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.workflow_id]);

  return useMemo(() => {
    const selectedWorkflowId = selectValidWorkflowId(workflowIds, searchParams.workflow_id);
    const selectedWorkflow = workflows[selectedWorkflowId];

    const setSelectedWorkflow = (workflowId?: string | null) => {
      setSearchParams((oldSearchParams) => {
        const newSearchParams = { ...oldSearchParams };
        if (workflowId) {
          newSearchParams.workflow_id = selectValidWorkflowId(workflowIds, workflowId);
        } else {
          delete newSearchParams.workflow_id;
        }
        return newSearchParams;
      });
    };

    if (searchParams.workflow_id !== selectedWorkflowId) {
      setSelectedWorkflow(selectedWorkflowId);
    }

    return [{ id: selectedWorkflowId, userValues: selectedWorkflow }, setSelectedWorkflow];
  }, [searchParams.workflow_id, setSearchParams, workflowIds, workflows]);
};

export default useSelectedWorkflow;
