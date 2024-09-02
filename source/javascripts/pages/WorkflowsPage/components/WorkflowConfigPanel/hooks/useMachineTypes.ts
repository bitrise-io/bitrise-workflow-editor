import { useQuery } from '@tanstack/react-query';
import MachineTypeApi from '@/core/api/MachineTypeApi';

type Props = {
  appSlug: string;
  canChangeMachineType: boolean;
};
const useMachineTypes = ({ appSlug, canChangeMachineType }: Props) => {
  return useQuery({
    enabled: !!(appSlug && canChangeMachineType),
    queryKey: ['machineTypes', { appSlug }],
    queryFn: ({ signal }) => MachineTypeApi.getMachineTypes({ appSlug, signal }),
    staleTime: Infinity,
  });
};

export default useMachineTypes;
