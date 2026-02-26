import { useStore } from 'zustand';

import { modularConfigStore, ModularConfigStoreState } from '@/core/stores/ModularConfigStore';
import { useShallow } from '@/hooks/useShallow';

function useModularConfig<U = ModularConfigStoreState>(selector?: (state: ModularConfigStoreState) => U) {
  return useStore(modularConfigStore, useShallow(selector ?? ((s) => s as unknown as U)));
}

export default useModularConfig;
