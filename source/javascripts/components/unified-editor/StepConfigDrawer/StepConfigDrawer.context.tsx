import { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import useStep from '@/hooks/useStep';

type Props = { workflowId: string; stepIndex: number };
type State = Exclude<ReturnType<typeof useStep>, undefined>;

const initialState: State = { data: undefined, isLoading: false };
const Context = createContext<State>(initialState);

const StepConfigDrawerProvider = ({ children, workflowId, stepIndex }: PropsWithChildren<Props>) => {
  const result = useStep(workflowId, stepIndex);
  const value = useMemo<State>(() => result ?? initialState, [result]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export default StepConfigDrawerProvider;

export const useStepDrawerContext = () => useContext(Context);
