import { useMemo } from 'react';
import { useWorkflows } from './useWorkflows';
import useSearchParams from '@/hooks/useSearchParams';
import { WithId, withId } from '@/models/WithId';
import { Workflow } from '@/models/Workflow';

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
