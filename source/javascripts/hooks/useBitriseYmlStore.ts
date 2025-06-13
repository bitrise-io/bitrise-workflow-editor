import { useMemo } from 'react';
import { Document } from 'yaml';
import { useStore } from 'zustand';

import { BitriseYml } from '@/core/models/BitriseYml';
import { bitriseYmlStore, BitriseYmlStoreState } from '@/core/stores/BitriseYmlStore';
import { useShallow } from '@/hooks/useShallow';

type ExtendedBitriseYmlStoreState = Omit<BitriseYmlStoreState, 'yml'> & {
  yml: BitriseYml;
};

let cachedYmlJson: BitriseYml | null = null;
let cachedYmlDocument: Document | null = null;

function useBitriseYmlStore<U = ExtendedBitriseYmlStoreState>(selector?: (state: ExtendedBitriseYmlStoreState) => U) {
  const ymlDocument = useStore(bitriseYmlStore, (state) => state.ymlDocument);

  const ymlJson = useMemo(() => {
    if (ymlDocument !== cachedYmlDocument) {
      cachedYmlJson = ymlDocument.toJSON() as BitriseYml;
      cachedYmlDocument = ymlDocument;
    }

    return cachedYmlJson as BitriseYml;
  }, [ymlDocument]);

  const withBitriseYml = useShallow((state: BitriseYmlStoreState) => ({ ...state, yml: ymlJson }));
  const finalSelector = selector ? (state: BitriseYmlStoreState) => selector(withBitriseYml(state)) : withBitriseYml;

  return useStore(bitriseYmlStore, useShallow(finalSelector as any)) as U;
}

export default useBitriseYmlStore;
