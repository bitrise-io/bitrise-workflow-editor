import { useWorkflows } from './useWorkflows';
import useSearchParams from '@/hooks/useSearchParams';
import { WithId, withId } from '@/models/WithId';
import { Workflow } from '@/models/Workflow';

const useSelectedWorkflow = (): WithId<Workflow> => {
  const workflows = useWorkflows();
  const [searchParams] = useSearchParams();
  const selectedWorkflowId = searchParams.workflow_id || Object.keys(workflows)[0];

  return withId(Object.entries(workflows).find(([id]) => id === selectedWorkflowId) ?? ['', {}]);
};

export default useSelectedWorkflow;
