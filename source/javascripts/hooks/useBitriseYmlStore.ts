import { useContext } from 'react';
import { useStore } from 'zustand';
import { useShallow } from '@/hooks/useShallow';
import { BitriseYmlStoreState } from '@/core/stores/BitriseYmlStore';
import { BitriseYmlContext } from '@/contexts/BitriseYmlProvider';

function useBitriseYmlStore<U = BitriseYmlStoreState>(selector?: (state: BitriseYmlStoreState) => U) {
  const store = useContext(BitriseYmlContext);

  if (!store) {
    throw new Error('useBitriseYmlStore must be used within a BitriseYmlProvider');
  }

  return useStore(store, useShallow(selector || ((s) => s as U)));
}

export function useBitriseYmlStoreApi() {
  const store = useContext(BitriseYmlContext);

  if (!store) {
    throw new Error('useRawBitriseYmlStore must be used within a BitriseYmlProvider');
  }

  return store;
}

export default useBitriseYmlStore;
