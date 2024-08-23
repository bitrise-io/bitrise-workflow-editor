import { useMemo } from 'react';
import { WithId, withId } from '@/core/utils/WithId';
import { Workflow } from '@/core/models/Workflow';
import useSearchParams from './useSearchParams';
import { useWorkflows } from './useWorkflows';

type UseSelectedWorkflowResult = [
  selectedWorkflow: WithId<Workflow>,
  setSelectedWorkflow: (workflowId?: string | null) => void,
];

const useSelectedWorkflow = (): UseSelectedWorkflowResult => {
  const workflows = useWorkflows();
  const workflowIds = Object.keys(workflows);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedWorkflowId = searchParams.workflow_id || workflowIds[0];

  return useMemo(() => {
    const workflowEntries = Object.entries(workflows);
    // TODO: Thinking about how to notice the users when workflow is not found by the given ID.
    const selectedWorkflow = workflowEntries.find(([id]) => id === selectedWorkflowId) ?? ['', {}];

    const setSelectedWorkflow = (workflowId?: string | null) => {
      setSearchParams((oldSearchParams) => {
        return {
          ...oldSearchParams,
          workflow_id: workflowId && workflowIds.includes(workflowId) ? workflowId : workflowIds[0],
        };
      });
    };

    return [withId(selectedWorkflow), setSelectedWorkflow];
  }, [selectedWorkflowId, setSearchParams, workflowIds, workflows]);
};

export default useSelectedWorkflow;
