import { useQuery } from '@tanstack/react-query';
import { getAllStackInfoQueryOptions } from '../services/getAllStackInfo';

type Props = {
  appSlug: string;
};

const useStacks = ({ appSlug }: Props) => {
  return useQuery({
    enabled: !!appSlug,
    ...getAllStackInfoQueryOptions(appSlug),
    staleTime: 1000 * 60 * 5,
  });
};

export default useStacks;
