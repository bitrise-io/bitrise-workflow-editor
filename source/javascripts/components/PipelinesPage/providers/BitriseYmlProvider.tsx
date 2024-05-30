import { PropsWithChildren, createContext, useRef } from 'react';
import { createStore } from 'zustand';
import { BitriseYml } from '../PipelinesPage.types';

type BitriseYmlProviderProps = PropsWithChildren<{
  yml: BitriseYml;
}>;

export type BitriseYmlProviderState = {
  yml: BitriseYml;
};

type BitriseYmlStore = ReturnType<typeof createBitriseYmlStore>;

const createBitriseYmlStore = (yml: BitriseYml) => {
  return createStore<BitriseYmlProviderState>()(() => ({ yml }));
};

export const BitriseYmlContext = createContext<BitriseYmlStore | null>(null);

const BitriseYmlProvider = ({ yml, children }: BitriseYmlProviderProps) => {
  const store = useRef(createBitriseYmlStore(yml)).current;
  return <BitriseYmlContext.Provider value={store}>{children}</BitriseYmlContext.Provider>;
};

export default BitriseYmlProvider;
