import { useCallback, useEffect, useState } from 'react';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { useStepBundleConfigContext } from '@/components/unified-editor/StepBundlesConfig/StepBundlesConfig.context';

const useRenameStepBundle = (onChange?: (newStepBundleId: string) => void) => {
  const selectedStepBundleId = useStepBundleConfigContext()?.id ?? '';
  const stepBundleIdsInTheStore = useBitriseYmlStore((s) => Object.keys(s.yml.step_bundles ?? {}));

  const [isRenaming, setIsRenaming] = useState(false);
  const [nextStepBundleId, setNextStepBundleId] = useState(selectedStepBundleId);
  const [prevStepBundleId, setPrevStepBundleId] = useState(selectedStepBundleId);

  const { createStepBundle, renameStepBundle, deleteStepBundle } = useBitriseYmlStore((s) => ({
    createStepBundle: s.createStepBundle,
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
        createStepBundle(selectedStepBundleId, newStepBundleId);

        setNextStepBundleId(newStepBundleId);
        setPrevStepBundleId(selectedStepBundleId);
      }
    },
    [createStepBundle, renameStepBundle, selectedStepBundleId],
  );
};

export default useRenameStepBundle;
