import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import { EnvironmentVariable, HandlerFn } from './types';

type State = {
  isLoading: boolean;
  load: VoidFunction;
  create: HandlerFn;
  get: (key?: string) => EnvironmentVariable[];
};

const Context = createContext<State>({
  isLoading: false,
  load: () => undefined,
  create: () => undefined,
  get: () => [],
});

type Props = PropsWithChildren<{
  onCreate: HandlerFn;
  onLoad: () => Promise<EnvironmentVariable[]>;
}>;

const EnvVarProvider = ({ children, onLoad, onCreate }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [environmentVariables, setEnvironmentVariables] = useState<EnvironmentVariable[]>([]);

  const value = useMemo(() => {
    const load: State['load'] = () => {
      setIsLoading(!!onLoad);
      onLoad()
        .then(setEnvironmentVariables)
        .finally(() => setIsLoading(false));
    };
    const create: State['create'] = (envVar) => {
      setEnvironmentVariables((envVars) => [...envVars, envVar]);
      onCreate(envVar);
    };

    const get: State['get'] = (key) => {
      if (key) {
        return environmentVariables.filter((ev) => ev.key.toLowerCase() === key.toLowerCase());
      }
      return environmentVariables;
    };

    return { isLoading, load, create, get } as State;
  }, [isLoading, onLoad, onCreate, environmentVariables]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const useEnvironmentVariables = () => useContext(Context);

export default EnvVarProvider;
