import { StepBundles } from '@/core/models/BitriseYml';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

export function useStepBundles<U = StepBundles>(selector?: (state: StepBundles) => U): U {
  return useBitriseYmlStore(({ yml }) => {
    const stepBundles = yml.step_bundles || {};
    return selector ? selector(stepBundles) : stepBundles;
  }) as U;
}
