import { useMemo } from 'react';

import { BitriseYml } from '@/core/models/BitriseYml';
import { getMergedBitriseYml } from '@/core/stores/ModularConfigStore';

import useModularConfig from './useModularConfig';

export default function useMergedBitriseYml(): BitriseYml | undefined {
  const isModular = useModularConfig((s) => s.isModular);
  const mergedYmlString = useModularConfig((s) => s.mergedYmlString);

  return useMemo(() => {
    if (!isModular || !mergedYmlString) return undefined;
    return getMergedBitriseYml();
  }, [isModular, mergedYmlString]);
}
