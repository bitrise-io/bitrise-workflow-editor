import { useQuery } from '@tanstack/react-query';
import StacksAndMachinesApi from '@/core/api/StacksAndMachinesApi';
import { getAppSlug } from '@/services/app-service';

const useStacksAndMachines = () => {
  const appSlug = getAppSlug() ?? '';

  return useQuery({
    enabled: Boolean(appSlug),
    queryKey: [StacksAndMachinesApi.getStacksAndMachinesPath(appSlug)],
    queryFn: ({ signal }) => StacksAndMachinesApi.getStacksAndMachines({ appSlug, signal }),
    staleTime: Infinity,
  });
};

export default useStacksAndMachines;
