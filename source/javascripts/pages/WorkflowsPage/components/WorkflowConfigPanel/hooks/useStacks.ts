import { useQuery } from '@tanstack/react-query';
import { getAllStackInfoQueryOptions } from '../services/getAllStackInfo';

type Props = {
  appSlug: string;
};

const useStacks = ({ appSlug }: Props) => {
  return useQuery({
    enabled: !!appSlug,
    ...getAllStackInfoQueryOptions(appSlug),
    staleTime: Infinity,
  });
};

export default useStacks;
