import { Containers } from '@/core/models/BitriseYml';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

export function useContainers<U = Containers>(selector?: (state: Containers) => U): U {
  return useBitriseYmlStore(({ yml }) => {
    const containers = yml.containers || {};
    return selector ? selector(containers) : containers;
  }) as U;
}
