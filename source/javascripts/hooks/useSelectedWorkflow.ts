import { useCallback, useEffect, useMemo } from 'react';
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

  const selectedWorkflowId = selectValidWorkflowId(workflowIds, searchParams.workflow_id);
  const selectedWorkflow = useMemo(() => workflows[selectedWorkflowId], [selectedWorkflowId, workflows]);

  const setSelectedWorkflow = useCallback(
    (workflowId?: string | null) => {
      setSearchParams((oldSearchParams) => {
        const newSearchParams = { ...oldSearchParams };
        if (workflowId) {
          newSearchParams.workflow_id = selectValidWorkflowId(workflowIds, workflowId);
        } else {
          delete newSearchParams.workflow_id;
        }
        return newSearchParams;
      });
    },
    [workflowIds, setSearchParams],
  );

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
    // Only check if the query param changes
    // Otherwise the toast will show up when workflowIds change (for example, a workflow is added, deleted, reordered)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.workflow_id]);

  useEffect(() => {
    if (searchParams.workflow_id !== selectedWorkflowId) {
      setSelectedWorkflow(selectedWorkflowId);
    }
  }, [searchParams.workflow_id, selectedWorkflowId, setSelectedWorkflow]);

  return useMemo(() => {
    return [{ id: selectedWorkflowId, userValues: selectedWorkflow }, setSelectedWorkflow];
  }, [selectedWorkflow, selectedWorkflowId, setSelectedWorkflow]);
};

export default useSelectedWorkflow;
