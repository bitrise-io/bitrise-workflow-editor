import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import { useDisclosure } from '@bitrise/bitkit';

import EnvironmentVariablesDialog from './EnvironmentVariablesDialog';
import { EnvironmentVariable, HandlerFn } from './types';

type State = { open: (options: { onSelect: HandlerFn }) => void };
type Props = PropsWithChildren<{
  onOpen?: () => Promise<EnvironmentVariable[]>;
}>;

const Context = createContext<State>({ open: () => undefined });

const EnvironmentVariablesDialogProvider = ({ children, onOpen: onOpenExternal }: Props) => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [environmentVariables, setEnvironmentVariables] = useState<EnvironmentVariable[]>([]);

  const [dialogProps, setDialogProps] = useState<{ onSelect: HandlerFn }>({
    onSelect: () => undefined,
  });

  const value = useMemo(() => {
    const open: State['open'] = (options) => {
      onOpen();
      setDialogProps(options);
      onOpenExternal?.().then(setEnvironmentVariables);
    };

    return { open } as State;
  }, [onOpen, onOpenExternal]);

  return (
    <Context.Provider value={value}>
      {children}
      <EnvironmentVariablesDialog
        isOpen={isOpen}
        onClose={onClose}
        environmentVariables={environmentVariables}
        {...dialogProps}
      />
    </Context.Provider>
  );
};

export const useEnvironmentVariablesDialog = () => useContext(Context);

export default EnvironmentVariablesDialogProvider;
