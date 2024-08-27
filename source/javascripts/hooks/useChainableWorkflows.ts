import { useMemo } from 'react';
import Fuse from 'fuse.js';
import { useQuery } from '@tanstack/react-query';
import { useWorkflows } from '@/hooks/useWorkflows';
import WorkflowService from '@/core/models/WorkflowService';

type Props = {
  id: string;
  search: string;
};

const useChainableWorkflows = ({ id, search }: Props) => {
  const ymlWorkflows = useWorkflows();
  const chainableWorkflows = useMemo(() => WorkflowService.getChainableWorkflows(ymlWorkflows, id), [ymlWorkflows, id]);

  const index = useMemo(() => {
    return new Fuse(chainableWorkflows);
  }, [chainableWorkflows]);

  return useQuery({
    queryKey: ['workflows', { id, search, filter: 'chainable' }],
    queryFn: async () => {
      if (!search) {
        return chainableWorkflows;
      }

      return index.search(search).map((result) => result.item);
    },
  });
};

export { useChainableWorkflows };
