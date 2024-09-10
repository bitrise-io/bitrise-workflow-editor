import { useQuery } from '@tanstack/react-query';
import StacksAndMachinesApi from '@/core/api/StacksAndMachinesApi';

const useStacksAndMachines = () => {
  const appSlug = window.pageProps?.project?.slug ?? '';

  return useQuery({
    enabled: Boolean(appSlug),
    queryKey: [StacksAndMachinesApi.getStacksAndMachinesPath(appSlug)],
    queryFn: ({ signal }) => StacksAndMachinesApi.getStacksAndMachines({ appSlug, signal }),
    staleTime: Infinity,
  });
};

export default useStacksAndMachines;
