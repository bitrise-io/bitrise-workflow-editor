import { useQuery } from '@tanstack/react-query';
import StackApi from '@/core/api/StackApi';

const useStacks = ({ appSlug }: { appSlug: string }) => {
  return useQuery({
    enabled: !!appSlug,
    queryKey: ['stacks', { appSlug }],
    queryFn: ({ signal }) => StackApi.getStacks({ appSlug, signal }),
    staleTime: Infinity,
  });
};

export default useStacks;
