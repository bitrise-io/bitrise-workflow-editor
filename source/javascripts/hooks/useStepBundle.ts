import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

const useStepBundle = (id: string) => {
  return useBitriseYmlStore(({ yml }) => {
    const stepBundle = yml.step_bundles?.[id];

    if (!stepBundle) {
      return undefined;
    }

    return { cvs: `bundle::${id}`, id, userValues: stepBundle };
  });
};

export default useStepBundle;
