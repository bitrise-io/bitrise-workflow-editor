import { ComponentType, createContext, PropsWithChildren, useRef } from 'react';
import { createStore } from 'zustand';
import { BitriseYml, Meta } from '@/models/BitriseYml';

type BitriseYmlProviderProps = PropsWithChildren<{
  yml: BitriseYml;
  defaultMeta?: Meta;
}>;

export type BitriseYmlProviderState = {
  yml: BitriseYml;
  defaultMeta?: Meta;
};

type BitriseYmlStore = ReturnType<typeof createBitriseYmlStore>;

const createBitriseYmlStore = (yml: BitriseYml, defaultMeta?: Meta) => {
  return createStore<BitriseYmlProviderState>()(() => ({ yml, defaultMeta }));
};

export const BitriseYmlContext = createContext<BitriseYmlStore | null>(null);

const BitriseYmlProvider = ({ yml, defaultMeta, children }: BitriseYmlProviderProps) => {
  const store = useRef(createBitriseYmlStore(yml, defaultMeta)).current;
  return <BitriseYmlContext.Provider value={store}>{children}</BitriseYmlContext.Provider>;
};

export default BitriseYmlProvider;

export const withBitriseYml = (yml: BitriseYml, Component: ComponentType) => {
  return (
    <BitriseYmlProvider yml={yml}>
      <Component />
    </BitriseYmlProvider>
  );
};
