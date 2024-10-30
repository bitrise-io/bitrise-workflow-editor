import { useQuery } from '@tanstack/react-query';
import WindowUtils from '@/core/utils/WindowUtils';
import StacksAndMachinesApi from '@/core/api/StacksAndMachinesApi';
import RuntimeUtils from '@/core/utils/RuntimeUtils';

const useStacksAndMachines = () => {
  const appSlug = WindowUtils.appSlug() ?? '';
  const isWebsiteMode = RuntimeUtils.isWebsiteMode();

  return useQuery({
    enabled: Boolean(appSlug) && isWebsiteMode,
    queryKey: [StacksAndMachinesApi.getStacksAndMachinesPath(appSlug)],
    queryFn: ({ signal }) => StacksAndMachinesApi.getStacksAndMachines({ appSlug, signal }),
    staleTime: Infinity,
  });
};

export default useStacksAndMachines;
