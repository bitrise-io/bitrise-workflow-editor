import { useCallback, useEffect, useState } from 'react';

import StepBundleService from '@/core/services/StepBundleService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

const useRenameStepBundle = (stepBundleId: string = '', onChange?: (newStepBundleId: string) => void) => {
  const stepBundleIdsInTheStore = useBitriseYmlStore((s) => Object.keys(s.yml.step_bundles ?? {}));

  const [isRenaming, setIsRenaming] = useState(false);
  const [nextStepBundleId, setNextStepBundleId] = useState(stepBundleId);
  const [prevStepBundleId, setPrevStepBundleId] = useState(stepBundleId);

  const { renameStepBundle, deleteStepBundle } = useBitriseYmlStore((s) => ({
    renameStepBundle: s.renameStepBundle,
    deleteStepBundle: s.deleteStepBundle,
  }));

  const isNewStepBundlePersisted = stepBundleIdsInTheStore.includes(nextStepBundleId);
  const isNewStepBundleSelected = nextStepBundleId === stepBundleId;

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
      if (stepBundleId) {
        setIsRenaming(true);

        renameStepBundle(stepBundleId, newStepBundleId);
        StepBundleService.create(stepBundleId, { source: 'step_bundles', sourceId: newStepBundleId });

        setNextStepBundleId(newStepBundleId);
        setPrevStepBundleId(stepBundleId);
      }
    },
    [renameStepBundle, stepBundleId],
  );
};

export default useRenameStepBundle;
