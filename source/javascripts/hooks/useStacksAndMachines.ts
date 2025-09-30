import { useQuery } from '@tanstack/react-query';

import StacksAndMachinesApi from '@/core/api/StacksAndMachinesApi';
import PageProps from '@/core/utils/PageProps';
import RuntimeUtils from '@/core/utils/RuntimeUtils';

const useStacksAndMachines = () => {
  const appSlug = PageProps.appSlug();
  const isWebsiteMode = RuntimeUtils.isWebsiteMode();

  return useQuery({
    enabled: Boolean(appSlug) && isWebsiteMode,
    queryKey: [StacksAndMachinesApi.getStacksAndMachinesPath(appSlug)],
    queryFn: ({ signal }) => StacksAndMachinesApi.getStacksAndMachines({ appSlug, signal }),
    staleTime: Infinity,
  });
};

export default useStacksAndMachines;
