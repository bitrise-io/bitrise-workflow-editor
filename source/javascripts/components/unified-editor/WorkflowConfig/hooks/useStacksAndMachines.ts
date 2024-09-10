import { useQuery } from '@tanstack/react-query';
import WindowUtils from '@/core/utils/WindowUtils';
import StacksAndMachinesApi from '@/core/api/StacksAndMachinesApi';

const useStacksAndMachines = () => {
  const appSlug = WindowUtils.appSlug() ?? '';

  return useQuery({
    enabled: Boolean(appSlug),
    queryKey: [StacksAndMachinesApi.getStacksAndMachinesPath(appSlug)],
    queryFn: ({ signal }) => StacksAndMachinesApi.getStacksAndMachines({ appSlug, signal }),
    staleTime: Infinity,
  });
};

export default useStacksAndMachines;
