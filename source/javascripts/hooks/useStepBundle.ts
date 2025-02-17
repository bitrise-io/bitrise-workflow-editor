import StepBundleService from '@/core/services/StepBundleService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

const useStepBundle = (id: string) => {
  return useBitriseYmlStore(({ yml }) => {
    const stepBundle = yml.step_bundles?.[id];

    if (!stepBundle) {
      return undefined;
    }

    return { cvs: StepBundleService.idToCvs(id), id, userValues: stepBundle };
  });
};

export default useStepBundle;
