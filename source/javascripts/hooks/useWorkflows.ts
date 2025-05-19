import { Workflows } from '@/core/models/BitriseYml';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

export function useWorkflows<U = Workflows>(selector?: (state: Workflows) => U): U {
  return useBitriseYmlStore(({ yml }) => {
    const workflows = yml.workflows || {};
    return selector ? selector(workflows) : workflows;
  }) as U;
}
