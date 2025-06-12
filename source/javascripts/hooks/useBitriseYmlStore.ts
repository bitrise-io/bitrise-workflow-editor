import { useMemo } from 'react';
import { useStore } from 'zustand';

import { BitriseYml } from '@/core/models/BitriseYml';
import { bitriseYmlStore, BitriseYmlStoreState } from '@/core/stores/BitriseYmlStore';
import { useShallow } from '@/hooks/useShallow';

type ExtendedBitriseYmlStoreState = Omit<BitriseYmlStoreState, 'yml'> & {
  yml: BitriseYml;
};

function useBitriseYmlStore<U = ExtendedBitriseYmlStoreState>(selector?: (state: ExtendedBitriseYmlStoreState) => U) {
  const ymlDocument = useStore(bitriseYmlStore, (state) => state.ymlDocument);
  const ymlDocumentAsJson = useMemo(() => ymlDocument.toJSON() as BitriseYml, [ymlDocument]);
  const withBitriseYml = useShallow((state: BitriseYmlStoreState) => ({ ...state, yml: ymlDocumentAsJson }));

  const finalSelector = selector ? (state: BitriseYmlStoreState) => selector(withBitriseYml(state)) : withBitriseYml;

  return useStore(bitriseYmlStore, useShallow(finalSelector as any)) as U;
}

export default useBitriseYmlStore;
