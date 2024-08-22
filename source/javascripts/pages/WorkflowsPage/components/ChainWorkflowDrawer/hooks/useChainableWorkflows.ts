import { useMemo } from 'react';
import { useWorkflows } from '@/pages/WorkflowsPage/hooks/useWorkflows';
import WorkflowService from '@/core/models/WorkflowService';

type Props = {
  id: string;
};

const useChainableWorkflows = ({ id }: Props): string[] => {
  const workflows = useWorkflows();
  return useMemo(() => WorkflowService.getChainableWorkflows(workflows, id), [workflows, id]);
};

export default useChainableWorkflows;
