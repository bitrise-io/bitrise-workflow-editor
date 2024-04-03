import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import { useDisclosure } from '@bitrise/bitkit';

import SecretsDialog from './SecretsDialog';
import { HandlerFn, Secret } from './types';

type State = { open: (options: { onSelect: HandlerFn }) => void };
type Props = PropsWithChildren<{
  onOpen?: () => Promise<Secret[]>;
  onCreate: HandlerFn;
}>;

const Context = createContext<State>({ open: () => undefined });

const SecretsDialogProvider = ({ children, onOpen: onOpenExternal, onCreate }: Props) => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [secrets, setSecrets] = useState<Secret[]>([]);

  const [dialogProps, setDialogProps] = useState<{ onSelect: HandlerFn }>({
    onSelect: () => undefined,
  });

  const value = useMemo(() => {
    const open: State['open'] = (options) => {
      onOpen();
      setDialogProps(options);
      onOpenExternal?.().then(setSecrets);
    };

    return { open } as State;
  }, [onOpen, onOpenExternal]);

  const handleCreate = (secret: Secret) => {
    onCreate(secret);
    setSecrets((s) => [...s, secret]);
  };

  return (
    <Context.Provider value={value}>
      {children}
      <SecretsDialog isOpen={isOpen} secrets={secrets} onClose={onClose} onCreate={handleCreate} {...dialogProps} />
    </Context.Provider>
  );
};

export const useSecretsDialog = () => useContext(Context);

export default SecretsDialogProvider;
