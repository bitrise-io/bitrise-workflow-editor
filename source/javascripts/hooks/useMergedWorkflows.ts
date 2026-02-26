import { useMemo } from 'react';

import { getMergedBitriseYml } from '@/core/stores/ModularConfigStore';

import useModularConfig from './useModularConfig';

export default function useMergedWorkflows(): string[] {
  const mergedYmlString = useModularConfig((s) => s.mergedYmlString);

  return useMemo(() => {
    if (!mergedYmlString) return [];

    const mergedYml = getMergedBitriseYml();
    if (!mergedYml?.workflows) return [];

    return Object.keys(mergedYml.workflows);
  }, [mergedYmlString]);
}
