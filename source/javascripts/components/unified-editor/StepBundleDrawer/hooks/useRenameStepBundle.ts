import { useCallback } from 'react';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

const useRenameStepBundle = (selectedStepBundleId: string) => {
  const { renameStepBundle } = useBitriseYmlStore((s) => ({
    renameStepBundle: s.renameStepBundle,
  }));

  return useCallback(
    (newStepBundleId: string) => {
      if (selectedStepBundleId) {
        renameStepBundle(selectedStepBundleId, newStepBundleId);
      }
    },
    [renameStepBundle, selectedStepBundleId],
  );
};

export default useRenameStepBundle;
