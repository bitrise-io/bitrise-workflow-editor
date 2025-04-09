import { ComponentType, createContext, PropsWithChildren, useEffect } from 'react';
import { BitriseYml } from '@/core/models/BitriseYml';
import { bitriseYmlStore, BitriseYmlStore } from '@/core/stores/BitriseYmlStore';

type BitriseYmlProviderProps = PropsWithChildren<{
  yml: BitriseYml;
  onChange?: (yml: BitriseYml) => void;
}>;

const BitriseYmlContext = createContext<BitriseYmlStore | null>(null);

const BitriseYmlProvider = ({ yml, children, onChange }: BitriseYmlProviderProps) => {
  useEffect(() => {
    bitriseYmlStore.setState({ yml, savedYml: yml });
  }, [yml]);

  useEffect(() => {
    const unsubsribe = bitriseYmlStore.subscribe(({ yml: currentYml }, { yml: previousYml }) => {
      if (onChange && JSON.stringify(currentYml) !== JSON.stringify(previousYml)) {
        onChange(currentYml);
      }
    });

    return unsubsribe;
  }, [onChange]);

  return <BitriseYmlContext.Provider value={bitriseYmlStore}>{children}</BitriseYmlContext.Provider>;
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
