import { useMemo } from 'react';
import Fuse from 'fuse.js';
import { useQuery } from '@tanstack/react-query';
import useChainableWorkflows from './useChainableWorkflows';

type Props = {
  id: string;
  search: string;
};
const useSearchChainableWorkflows = ({ id, search }: Props) => {
  const workflows = useChainableWorkflows({ id });
  const index = useMemo(() => {
    const options = {
      keys: [{ name: 'id', weight: 2 }],
      threshold: 0.25,
      ignoreLocation: true,
      useExtendedSearch: true,
    };
    const idx = Fuse.createIndex(options.keys, workflows);
    return new Fuse(workflows, options, idx);
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
