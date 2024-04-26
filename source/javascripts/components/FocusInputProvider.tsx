import { PropsWithChildren, createContext, useContext, useMemo } from 'react';

type Props = PropsWithChildren<{
  focusInput?: string;
  onChangeFocusInput: (name?: string) => void;
}>;

const Context = createContext<Omit<Props, 'children'>>({
  onChangeFocusInput: () => undefined,
});

// TODO: Please remove all code that is related to the 'lose input focus on safe digest'
//       issue after we have completely removed AngularJS from the workflows page.
const FocusInputProvider = ({ children, focusInput, onChangeFocusInput }: Props) => {
  const value = useMemo(() => ({ focusInput, onChangeFocusInput }), [focusInput, onChangeFocusInput]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const useFocusInput = () => {
  const { focusInput, onChangeFocusInput } = useContext(Context);

  return {
    isInFocus: (name: string) => focusInput === name,
    handleFocus: (name: string) => () => onChangeFocusInput(name),
  };
};

export default FocusInputProvider;
