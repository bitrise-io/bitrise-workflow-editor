import { ComponentType, createContext, PropsWithChildren, useEffect, useRef } from 'react';
import { BitriseYml, Meta } from '@/core/models/BitriseYml';
import StoreFactory, { BitriseYmlStore } from '@/core/stores/BitriseYmlStore';

type BitriseYmlProviderProps = PropsWithChildren<{
  yml: BitriseYml;
  defaultMeta?: Meta;
  onChange?: (yml: BitriseYml) => void;
}>;

const BitriseYmlContext = createContext<BitriseYmlStore | null>(null);
const BitriseYmlProvider = ({ yml, defaultMeta, children, onChange }: BitriseYmlProviderProps) => {
  const store = useRef(StoreFactory.createBitriseYmlStore(yml, defaultMeta)).current;

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

export { BitriseYmlContext, withBitriseYml };
export default BitriseYmlProvider;
