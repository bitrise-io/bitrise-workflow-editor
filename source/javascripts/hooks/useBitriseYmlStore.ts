import { useStore } from 'zustand';

import { BitriseYml } from '@/core/models/BitriseYml';
import { bitriseYmlStore, BitriseYmlStoreState } from '@/core/stores/BitriseYmlStore';
import { useShallow } from '@/hooks/useShallow';

type ExtendedBitriseYmlStoreState = Omit<BitriseYmlStoreState, 'yml'> & {
  yml: BitriseYml;
};

function useBitriseYmlStore<U = ExtendedBitriseYmlStoreState>(selector?: (state: ExtendedBitriseYmlStoreState) => U) {
  const withBitriseYml = (state: BitriseYmlStoreState) => ({ ...state, yml: state.ymlDocument.toJSON() as BitriseYml });
  const finalSelector = selector ? (state: BitriseYmlStoreState) => selector(withBitriseYml(state)) : withBitriseYml;
  return useStore(bitriseYmlStore, useShallow(finalSelector as any)) as U;
}

export default useBitriseYmlStore;
