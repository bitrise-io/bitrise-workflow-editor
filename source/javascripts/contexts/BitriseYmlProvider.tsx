import { ComponentType, createContext, PropsWithChildren, useRef } from 'react';
import { createStore } from 'zustand';
import { BitriseYml, Meta, deleteWorkflow } from '@/models/BitriseYml';

type BitriseYmlProviderProps = PropsWithChildren<{
  yml: BitriseYml;
  defaultMeta?: Meta;
}>;

export type BitriseYmlProviderState = {
  yml: BitriseYml;
  defaultMeta?: Meta;

  // Workflow related actions
  deleteWorkflow: (workflowId: string) => void;
};

type BitriseYmlStore = ReturnType<typeof createBitriseYmlStore>;

const createBitriseYmlStore = (yml: BitriseYml, defaultMeta?: Meta) => {
  return createStore<BitriseYmlProviderState>()((set) => ({
    yml,
    defaultMeta,
    deleteWorkflow: (workflowId: string) => set((state) => ({ yml: deleteWorkflow(state.yml, workflowId) })),
  }));
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
