import { useQuery } from '@tanstack/react-query';
import { getMachineTypeConfigsQueryOptions } from '../services/getMachineTypeConfigs';

type Props = {
  appSlug: string;
  canChangeMachineType: boolean;
};
const useMachineTypes = ({ appSlug, canChangeMachineType }: Props) => {
  return useQuery({
    enabled: !!(appSlug && canChangeMachineType),
    ...getMachineTypeConfigsQueryOptions(appSlug),
    staleTime: Infinity,
  });
};

export default useMachineTypes;
