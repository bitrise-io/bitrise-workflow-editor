import { omit } from 'es-toolkit';
import { useCallback, useEffect, useMemo } from 'react';

import { Workflow } from '@/core/models/Workflow';
import { useWorkflows } from '@/hooks/useWorkflows';

import useSearchParams from './useSearchParams';

const GENERATED_WORKFLOW_ID_REGEX = /_[\d]+$/g;

function selectValidWorkflowId(workflowIds: string[], requestedId?: string | null): string {
  if (requestedId) {
    if (workflowIds.includes(requestedId)) {
      return requestedId;
    }

    // Check if the requested ID is a generated variant of an existing workflow ID (parallel workflow)
    // e.g., if the requested ID is "sharded-tests_13", check if "sharded-tests" exists
    const originalId = requestedId.replace(GENERATED_WORKFLOW_ID_REGEX, '');
    if (workflowIds.includes(originalId)) {
      return originalId;
    }
  }

  const runnableWorkflowIds = workflowIds.filter((id) => !id.startsWith('_'));
  return runnableWorkflowIds.length ? runnableWorkflowIds[0] : workflowIds[0];
}

type UseSelectedWorkflowResult = [
  selectedWorkflow: Workflow,
  setSelectedWorkflow: (workflowId?: string | null) => void,
];

const useSelectedWorkflow = (): UseSelectedWorkflowResult => {
  const workflows = useWorkflows();
  const workflowIds = Object.keys(workflows);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedWorkflowId = selectValidWorkflowId(workflowIds, searchParams.workflow_id);

  const selectedWorkflow = useMemo(() => {
    return {
      id: selectedWorkflowId,
      userValues: workflows[selectedWorkflowId],
    };
  }, [selectedWorkflowId, workflows]);

  const setSelectedWorkflow = useCallback(
    (workflowId?: string | null) => {
      setSearchParams((oldSearchParams) => {
        if (!workflowId) {
          return omit(oldSearchParams, ['workflow_id']);
        }

        return { ...oldSearchParams, workflow_id: workflowId };
      });
    },
    [setSearchParams],
  );

  useEffect(() => {
    if (searchParams.workflow_id !== selectedWorkflowId) {
      setSelectedWorkflow(selectedWorkflowId);
    }
  }, [searchParams.workflow_id, selectedWorkflowId, setSelectedWorkflow]);

  return useMemo(() => [selectedWorkflow, setSelectedWorkflow], [selectedWorkflow, setSelectedWorkflow]);
};

export default useSelectedWorkflow;
