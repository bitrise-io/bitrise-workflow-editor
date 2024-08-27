import { useMemo } from 'react';
import { useWorkflows } from '@/hooks/useWorkflows';
import WorkflowService from '@/core/models/WorkflowService';

const useChainableWorkflows = (id: string): string[] => {
  const workflows = useWorkflows();
  return useMemo(() => WorkflowService.getChainableWorkflows(workflows, id), [workflows, id]);
};

export default useChainableWorkflows;
