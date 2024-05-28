import { useContext } from 'react';
import { useStore } from 'zustand';
import { BitriseYmlContext, BitriseYmlProviderState } from '../providers/BitriseYmlProvider';

const useBitriseYmlStore = <U>(selector: (state: BitriseYmlProviderState) => U) => {
  const store = useContext(BitriseYmlContext);

  if (!store) {
    throw new Error('Missing BitriseYmlContext.Provider in the tree');
  }

  return useStore(store, selector);
};

export default useBitriseYmlStore;
