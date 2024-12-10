import { useCallback, useEffect, useState } from 'react';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

const useRenameStepBundle = (selectedStepBundleId: string, onChange?: (newStepBundleId: string) => void) => {
  const stepBundleIdsInTheStore = useBitriseYmlStore((s) => Object.keys(s.yml.step_bundles ?? {}));

  const [isRenaming, setIsRenaming] = useState(false);
  const [nextStepBundleId, setNextStepBundleId] = useState(selectedStepBundleId);
  const [prevStepBundleId, setPrevStepBundleId] = useState(selectedStepBundleId);

  const { renameStepBundle, deleteStepBundle } = useBitriseYmlStore((s) => ({
    renameStepBundle: s.renameStepBundle,
    deleteStepBundle: s.deleteStepBundle,
  }));

  const isNewStepBundlePersisted = stepBundleIdsInTheStore.includes(nextStepBundleId);
  const isNewStepBundleSelected = nextStepBundleId === selectedStepBundleId;

  const shouldRunOnChange = isRenaming && isNewStepBundlePersisted && !isNewStepBundleSelected;
  const shouldFinishRenaming = isRenaming && isNewStepBundlePersisted && isNewStepBundleSelected;

  useEffect(() => {
    if (shouldRunOnChange) {
      onChange?.(nextStepBundleId);
    }
  }, [onChange, shouldRunOnChange, nextStepBundleId]);

  useEffect(() => {
    if (shouldFinishRenaming) {
      setIsRenaming(false);
      deleteStepBundle(prevStepBundleId);
    }
  }, [deleteStepBundle, shouldFinishRenaming, prevStepBundleId]);

  return useCallback(
    (newStepBundleId: string) => {
      if (selectedStepBundleId) {
        setIsRenaming(true);

        renameStepBundle(selectedStepBundleId, newStepBundleId);

        setNextStepBundleId(newStepBundleId);
        setPrevStepBundleId(selectedStepBundleId);
      }
    },
    [renameStepBundle, selectedStepBundleId],
  );
};

export default useRenameStepBundle;
