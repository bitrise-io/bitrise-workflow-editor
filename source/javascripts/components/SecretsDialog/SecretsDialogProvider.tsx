import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import { useDisclosure } from '@bitrise/bitkit';

import SecretsDialog from './SecretsDialog';
import { HandlerFn, Secret } from './types';

type State = { open: (options: { onSelect: HandlerFn }) => void };
type Props = PropsWithChildren<{
  defaultSecrets?: Secret[];
  onCreate: HandlerFn;
}>;

const Context = createContext<State>({ open: () => undefined });

const SecretsDialogProvider = ({ children, defaultSecrets = [], onCreate }: Props) => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [secrets, setSecrets] = useState(defaultSecrets);

  const [dynamicProps, setDynamicProps] = useState<{ onSelect: HandlerFn }>({
    onSelect: () => undefined,
  });

  const value = useMemo(() => {
    const open: State['open'] = (options) => {
      onOpen();
      setDynamicProps(options);
    };

    return { open } as State;
  }, [onOpen]);

  const handleCreate = (secret: Secret) => {
    onCreate(secret);
    setSecrets((s) => [...s, secret]);
  };

  return (
    <Context.Provider value={value}>
      {children}
      <SecretsDialog isOpen={isOpen} secrets={secrets} onClose={onClose} onCreate={handleCreate} {...dynamicProps} />
    </Context.Provider>
  );
};

export const useSecretsDialog = () => useContext(Context);

export default SecretsDialogProvider;
