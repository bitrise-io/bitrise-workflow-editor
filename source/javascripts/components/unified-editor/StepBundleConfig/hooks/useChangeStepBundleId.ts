import { useCallback, useEffect, useState } from 'react';

import StepBundleService from '@/core/services/StepBundleService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

const useChangeStepBundleId = (stepBundleId: string = '', onChange?: (newStepBundleId: string) => void) => {
  const stepBundleIdsInTheStore = useBitriseYmlStore((s) => Object.keys(s.yml.step_bundles ?? {}));

  const [isChanging, setIsChanging] = useState(false);
  const [nextStepBundleId, setNextStepBundleId] = useState(stepBundleId);
  const [prevStepBundleId, setPrevStepBundleId] = useState(stepBundleId);

  const isNewStepBundlePersisted = stepBundleIdsInTheStore.includes(nextStepBundleId);
  const isNewStepBundleSelected = nextStepBundleId === stepBundleId;

  const shouldRunOnChange = isChanging && isNewStepBundlePersisted && !isNewStepBundleSelected;
  const shouldFinishChanging = isChanging && isNewStepBundlePersisted && isNewStepBundleSelected;

  useEffect(() => {
    if (shouldRunOnChange) {
      onChange?.(nextStepBundleId);
    }
  }, [onChange, shouldRunOnChange, nextStepBundleId]);

  useEffect(() => {
    if (shouldFinishChanging) {
      setIsChanging(false);
      StepBundleService.deleteStepBundle(prevStepBundleId);
    }
  }, [shouldFinishChanging, prevStepBundleId]);

  return useCallback(
    (newStepBundleId: string) => {
      if (stepBundleId) {
        setIsChanging(true);

        StepBundleService.changeStepBundleId(stepBundleId, newStepBundleId);
        StepBundleService.createStepBundle(stepBundleId, { source: 'step_bundles', sourceId: newStepBundleId });

        setNextStepBundleId(newStepBundleId);
        setPrevStepBundleId(stepBundleId);
      }
    },
    [stepBundleId],
  );
};

export default useChangeStepBundleId;
