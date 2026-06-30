import { omit } from 'es-toolkit';
import { useCallback, useEffect, useMemo } from 'react';

import { useWorkflows } from '@/hooks/useWorkflows';

import useSearchParams, { getSearchParamsFromLocationHash } from './useSearchParams';

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
  selectedWorkflowId: string,
  setSelectedWorkflow: (workflowId?: string | null) => void,
];

const useSelectedWorkflow = (): UseSelectedWorkflowResult => {
  const workflowIds = useWorkflows((s) => Object.keys(s));
  // Subscribe to hash changes for re-renders, but validate against the LIVE hash
  // (not the snapshot): during a synchronous jump-to-definition the active file
  // swaps before `hashchange` fires, so the snapshot lags and would yield a
  // fallback id — which the effect below then pins into the URL, clobbering the
  // jump target.
  const [, setSearchParams] = useSearchParams();
  const requestedWorkflowId = getSearchParamsFromLocationHash().workflow_id;
  const selectedWorkflowId = selectValidWorkflowId(workflowIds, requestedWorkflowId);

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
    if (requestedWorkflowId !== selectedWorkflowId) {
      setSelectedWorkflow(selectedWorkflowId);
    }
  }, [requestedWorkflowId, selectedWorkflowId, setSelectedWorkflow]);

  return useMemo(() => [selectedWorkflowId, setSelectedWorkflow], [selectedWorkflowId, setSelectedWorkflow]);
};

export default useSelectedWorkflow;
