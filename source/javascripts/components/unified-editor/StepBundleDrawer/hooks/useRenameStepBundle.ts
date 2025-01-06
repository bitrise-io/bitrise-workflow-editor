import { useCallback } from 'react';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

const useRenameStepBundle = (selectedStepBundleId: string, onChange?: (newStepBundleId: string) => void) => {
  const { renameStepBundle } = useBitriseYmlStore((s) => ({
    renameStepBundle: s.renameStepBundle,
  }));

  return useCallback(
    (newStepBundleId: string) => {
      if (selectedStepBundleId) {
        renameStepBundle(selectedStepBundleId, newStepBundleId);
        onChange?.(newStepBundleId);
      }
    },
    [onChange, renameStepBundle, selectedStepBundleId],
  );
};

export default useRenameStepBundle;
