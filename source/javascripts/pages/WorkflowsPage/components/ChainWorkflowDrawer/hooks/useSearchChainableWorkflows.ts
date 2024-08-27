import { useMemo } from 'react';
import Fuse from 'fuse.js';
import { useQuery } from '@tanstack/react-query';
import useChainableWorkflows from './useChainableWorkflows';

type Props = {
  id: string;
  search: string;
};
const useSearchChainableWorkflows = ({ id, search }: Props) => {
  const workflows = useChainableWorkflows(id);
  const index = useMemo(() => {
    return new Fuse(workflows);
  }, [workflows]);

  return useQuery({
    queryKey: ['workflows', { id, search, filter: 'chainable' }],
    queryFn: async () => {
      if (!search) {
        return workflows;
      }

      return index.search(search).map((result) => result.item);
    },
  });
};

export default useSearchChainableWorkflows;
