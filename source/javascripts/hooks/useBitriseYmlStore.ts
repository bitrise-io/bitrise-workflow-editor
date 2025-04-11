import { useStore } from 'zustand';
import { useShallow } from '@/hooks/useShallow';
import { bitriseYmlStore, BitriseYmlStoreState } from '@/core/stores/BitriseYmlStore';

function useBitriseYmlStore<U = BitriseYmlStoreState>(selector?: (state: BitriseYmlStoreState) => U) {
  return useStore(bitriseYmlStore, useShallow(selector || ((s) => s as U)));
}

export default useBitriseYmlStore;
