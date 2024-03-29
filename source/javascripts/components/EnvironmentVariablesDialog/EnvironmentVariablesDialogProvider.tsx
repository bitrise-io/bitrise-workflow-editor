import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import { useDisclosure } from '@bitrise/bitkit';

import EnvironmentVariablesDialog from './EnvironmentVariablesDialog';
import { EnvironmentVariable, HandlerFn } from './types';

type State = { open: (options: { onSelect: HandlerFn }) => void };
type Props = PropsWithChildren<{
  environmentVariables?: EnvironmentVariable[];
}>;

const Context = createContext<State>({ open: () => undefined });

const EnvironmentVariablesDialogProvider = ({ children, environmentVariables = [] }: Props) => {
  const { isOpen, onClose, onOpen } = useDisclosure();

  const [dialogProps, setDialogProps] = useState<{ onSelect: HandlerFn }>({
    onSelect: () => undefined,
  });

  const value = useMemo(() => {
    const open: State['open'] = (options) => {
      onOpen();
      setDialogProps(options);
    };

    return { open } as State;
  }, [onOpen]);

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
