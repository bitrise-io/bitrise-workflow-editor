import { useWorkflows } from './useWorkflows';
import useSearchParams from '@/hooks/useSearchParams';
import { Workflow } from '@/models/Workflow';

const useSelectedWorkflow = (): [workflowId: string, Workflow] => {
  const workflows = useWorkflows();
  const [searchParams] = useSearchParams();
  const selectedWorkflowId = searchParams.workflow_id || Object.keys(workflows)[0];

  return Object.entries(workflows).find(([id]) => id === selectedWorkflowId) ?? ['', {}];
};

export default useSelectedWorkflow;
