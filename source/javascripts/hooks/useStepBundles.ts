import { StepBundles } from '@/core/models/Step';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

export const useStepBundles = (): StepBundles => {
  return useBitriseYmlStore(({ yml }) => yml.step_bundles || {});
};
