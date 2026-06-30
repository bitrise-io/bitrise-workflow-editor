import { omit } from 'es-toolkit';
import { useCallback, useEffect, useMemo } from 'react';

import { useStepBundles } from '@/hooks/useStepBundles';

import useSearchParams, { getSearchParamsFromLocationHash } from './useSearchParams';

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
  // Validate against the LIVE hash (not the snapshot) so a synchronous
  // jump-to-definition isn't clobbered by the self-correcting effect below.
  // See useSelectedWorkflow for the full rationale.
  const [, setSearchParams] = useSearchParams();
  const requestedStepBundleId = getSearchParamsFromLocationHash().step_bundle_id;
  const selectedStepBundleId = selectValidStepBundleId(stepBundleIds, requestedStepBundleId);

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
    if (requestedStepBundleId !== selectedStepBundleId) {
      setSelectedStepBundle(selectedStepBundleId);
    }
  }, [requestedStepBundleId, selectedStepBundleId, setSelectedStepBundle]);

  return useMemo(() => [selectedStepBundleId, setSelectedStepBundle], [selectedStepBundleId, setSelectedStepBundle]);
};

export default useSelectedStepBundle;
