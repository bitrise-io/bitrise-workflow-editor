import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import { Secret } from '@/core/models/Secret';
import { HandlerFn } from './types';

type State = {
  isLoading: boolean;
  load: VoidFunction;
  create: HandlerFn;
  get: (key?: string) => Secret[];
};

const Context = createContext<State>({
  isLoading: false,
  load: () => undefined,
  create: () => undefined,
  get: () => [],
});

type Props = PropsWithChildren<{
  onCreate: HandlerFn;
  onLoad: () => Promise<Secret[]>;
}>;

const SecretsProvider = ({ children, onLoad, onCreate }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [secrets, setSecrets] = useState<Secret[]>([]);

  const value = useMemo(() => {
    const load: State['load'] = () => {
      setIsLoading(!!onLoad);
      onLoad?.()
        .then(setSecrets)
        .finally(() => setIsLoading(false));
    };

    const create: State['create'] = (secret) => {
      setSecrets((s) => [...s, secret]);
      onCreate(secret);
    };

    const get: State['get'] = (key) => {
      if (key) {
        return secrets.filter((s) => s.key.toLowerCase() === key.toLowerCase());
      }
      return secrets;
    };

    return { isLoading, load, create, get } as State;
  }, [isLoading, onCreate, onLoad, secrets]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const useSecrets = () => useContext(Context);

export default SecretsProvider;
