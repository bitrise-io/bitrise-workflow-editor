import { useContext } from 'react';
import { useStore } from 'zustand';
import { BitriseYmlContext } from '@/contexts/BitriseYmlProvider';
import { BitriseYmlStoreState } from '@/core/stores/BitriseYmlStore';

const useBitriseYmlStore = <U>(selector: (state: BitriseYmlStoreState) => U) => {
  const store = useContext(BitriseYmlContext);

  if (!store) {
    throw new Error('Missing BitriseYmlContext.Provider in the tree');
  }

  return useStore(store, selector);
};

export default useBitriseYmlStore;
