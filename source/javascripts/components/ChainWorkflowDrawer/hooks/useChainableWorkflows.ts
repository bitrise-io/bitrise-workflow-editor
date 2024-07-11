import { useMemo } from 'react';
import { useWorkflows } from '@/hooks/useWorkflows';
import { extractChainableWorkflows } from '@/models/Workflow';

type Props = {
  id: string;
};

const useChainableWorkflows = ({ id }: Props): string[] => {
  const workflows = useWorkflows();
  return useMemo(() => extractChainableWorkflows(workflows, id), [workflows, id]);
};

export default useChainableWorkflows;
