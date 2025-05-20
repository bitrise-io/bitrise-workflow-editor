import { omit } from 'es-toolkit';
import { useCallback, useEffect, useMemo } from 'react';

import { useStepBundles } from '@/hooks/useStepBundles';

import useSearchParams from './useSearchParams';

function selectValidStepBundleId(stepBundleIds: string[], requestedId?: string | null): string {
  if (requestedId && stepBundleIds.includes(requestedId)) {
    return requestedId;
  }
  return stepBundleIds[0];
}

type UseSelectedStepBundleResult = [
  selectedStepBundleId: string,
  setSelectedStepBundle: (stepBundleId?: string | null) => void,
];

const useSelectedStepBundle = (): UseSelectedStepBundleResult => {
  const stepBundleIds = useStepBundles((s) => Object.keys(s));
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedStepBundleId = selectValidStepBundleId(stepBundleIds, searchParams.step_bundle_id);

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

  return useMemo(() => [selectedStepBundleId, setSelectedStepBundle], [selectedStepBundleId, setSelectedStepBundle]);
};

export default useSelectedStepBundle;
