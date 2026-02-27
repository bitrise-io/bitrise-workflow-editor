import { useMemo } from 'react';

import { BitriseYml } from '@/core/models/BitriseYml';
import { getMergedBitriseYml } from '@/core/stores/ModularConfigStore';

import useModularConfig from './useModularConfig';

/**
 * Returns the parsed merged BitriseYml reactively.
 * Updates whenever the mergedYmlString changes in ModularConfigStore.
 * Returns undefined when not in modular mode or no merged result available.
 */
export default function useMergedBitriseYml(): BitriseYml | undefined {
  const isModular = useModularConfig((s) => s.isModular);
  const mergedYmlString = useModularConfig((s) => s.mergedYmlString);

  return useMemo(() => {
    if (!isModular || !mergedYmlString) return undefined;
    return getMergedBitriseYml();
  }, [isModular, mergedYmlString]);
}
