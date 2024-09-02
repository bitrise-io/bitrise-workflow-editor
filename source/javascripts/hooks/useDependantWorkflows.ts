import { useMemo } from 'react';
import WorkflowService from '@/core/models/WorkflowService';
import { useWorkflows } from '@/hooks/useWorkflows';

const useDependantWorkflows = (workflowId: string) => {
  const workflows = useWorkflows();
  return useMemo(() => WorkflowService.getDependantWorkflows(workflows, workflowId), [workflows, workflowId]);
};

export default useDependantWorkflows;
