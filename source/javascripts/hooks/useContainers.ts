import { Container, ContainerType } from '@/core/models/Container';
import ContainerService from '@/core/services/ContainerService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

type ReturnValue = {
  all: Container[];
  [ContainerType.Execution]: Container[];
  [ContainerType.Service]: Container[];
};

function useContainers(): ReturnValue {
  return useBitriseYmlStore(({ yml }) => {
    const containers = ContainerService.getAllContainers(yml.containers || {});
    return {
      all: containers,
      [ContainerType.Execution]: containers.filter((c) => c.userValues.type === ContainerType.Execution),
      [ContainerType.Service]: containers.filter((c) => c.userValues.type === ContainerType.Service),
    };
  });
}

export default useContainers;
