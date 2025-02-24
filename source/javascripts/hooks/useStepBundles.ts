import { StepBundles } from '@/core/models/BitriseYml';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

export const useStepBundles = (): StepBundles => {
  return useBitriseYmlStore(({ yml }) => yml.step_bundles || {});
};
