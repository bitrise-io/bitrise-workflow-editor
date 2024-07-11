import { useMemo } from 'react';
import { extractUsedByWorkflows } from '@/models/Workflow';
import { useWorkflows } from '@/hooks/useWorkflows';

type Props = {
  id: string;
};

const useWorkflowUsedBy = ({ id }: Props) => {
  const workflows = useWorkflows();
  return useMemo(() => extractUsedByWorkflows(workflows, id), [workflows, id]);
};

export default useWorkflowUsedBy;
