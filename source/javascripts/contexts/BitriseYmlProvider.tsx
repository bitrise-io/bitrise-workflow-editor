import { ComponentType, createContext, PropsWithChildren, useEffect, useRef } from 'react';
import { BitriseYml } from '@/core/models/BitriseYml';
import BitriseYmlStoreFactory, { BitriseYmlStore } from '@/core/stores/BitriseYmlStore';

type BitriseYmlProviderProps = PropsWithChildren<{
  yml: BitriseYml;
  onChange?: (yml: BitriseYml) => void;
}>;

const BitriseYmlContext = createContext<BitriseYmlStore | null>(null);

const BitriseYmlProvider = ({ yml, children, onChange }: BitriseYmlProviderProps) => {
  const store = useRef(BitriseYmlStoreFactory.create(yml)).current;

  useEffect(() => {
    const unsubsribe = store.subscribe(({ yml: currentYml }, { yml: previousYml }) => {
      if (onChange && JSON.stringify(currentYml) !== JSON.stringify(previousYml)) {
        onChange(currentYml);
      }
    });

    return unsubsribe;
  }, [store, onChange]);

  return <BitriseYmlContext.Provider value={store}>{children}</BitriseYmlContext.Provider>;
};

function withBitriseYml(yml: BitriseYml, Component: ComponentType) {
  return (
    <BitriseYmlProvider yml={yml}>
      <Component />
    </BitriseYmlProvider>
  );
}

export { withBitriseYml, BitriseYmlContext };

export default BitriseYmlProvider;
