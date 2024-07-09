import { useMemo } from 'react';
import { ChainableWorkflow } from '../ChainWorkflowDrawer.types';
import { useWorkflows } from '@/hooks/useWorkflows';
import { extractChainableWorkflows, extractUsedByWorkflows } from '@/models/Workflow';

type Props = {
  id: string;
};

const useChainableWorkflows = ({ id }: Props): ChainableWorkflow[] => {
  const workflows = useWorkflows();
  return useMemo(() => {
    const chainables = extractChainableWorkflows(workflows, id);
    return chainables.map((chainableId) => ({
      id: chainableId,
      usedBy: extractUsedByWorkflows(workflows, chainableId),
    }));
  }, [workflows, id]);
};

export default useChainableWorkflows;
