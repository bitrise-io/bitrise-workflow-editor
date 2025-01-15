import { useCallback, useEffect, useMemo } from 'react';
import { omit } from 'es-toolkit';
import { StepBundle } from '@/core/models/Step';
import { useStepBundles } from '@/hooks/useStepBundles';
import useSearchParams from './useSearchParams';

function selectValidStepBundleId(stepBundleIds: string[], requestedId?: string | null): string {
  if (requestedId && stepBundleIds.includes(requestedId)) {
    return requestedId;
  }
  return stepBundleIds[0];
}

type UseSelectedStepBundleResult = [
  selectedStepBundle: StepBundle,
  setSelectedStepBundle: (stepBundleId?: string | null) => void,
];

const useSelectedStepBundle = (): UseSelectedStepBundleResult => {
  const stepBundles = useStepBundles();
  const stepBundleIds = Object.keys(stepBundles);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedStepBundleId = selectValidStepBundleId(stepBundleIds, searchParams.step_bundle_id);

  const selectedStepBundle = useMemo(() => {
    return {
      id: selectedStepBundleId,
      userValues: stepBundles[selectedStepBundleId],
    };
  }, [selectedStepBundleId, stepBundles]);

  const setSelectedStepBundle = useCallback(
    (stepBundleId?: string | null) => {
      setSearchParams((oldSearchParams) => {
        if (!stepBundleId) {
          return omit(oldSearchParams, ['step_bundle_id']);
        }

        return { ...oldSearchParams, step_bundle_id: stepBundleId };
      });
    },
    [setSearchParams],
  );

  useEffect(() => {
    if (searchParams.step_bundle_id !== selectedStepBundleId) {
      setSelectedStepBundle(selectedStepBundleId);
    }
  }, [searchParams.step_bundle_id, selectedStepBundleId, setSelectedStepBundle]);

  return useMemo(
    () => [selectedStepBundle as StepBundle, setSelectedStepBundle],
    [selectedStepBundle, setSelectedStepBundle],
  );
};

export default useSelectedStepBundle;
