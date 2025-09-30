import { useStore } from 'zustand';

import { bitriseYmlStore, BitriseYmlStoreState } from '@/core/stores/BitriseYmlStore';
import { useShallow } from '@/hooks/useShallow';

function useBitriseYmlStore<U = BitriseYmlStoreState>(selector?: (state: BitriseYmlStoreState) => U) {
  return useStore(bitriseYmlStore, useShallow(selector ?? ((s) => s as unknown as U)));
}

export default useBitriseYmlStore;
