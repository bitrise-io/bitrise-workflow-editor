import { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import useStep from '@/hooks/useStep';

type Props = { workflowId: string; stepIndex: number };
type State = Exclude<ReturnType<typeof useStep>, undefined>;

const initialState: State = { cvs: '', step: {}, isLoading: false };
const Context = createContext<State>(initialState);

const StepConfigDrawerProvider = ({ children, workflowId, stepIndex }: PropsWithChildren<Props>) => {
  const step = useStep(workflowId, stepIndex);
  const value = useMemo(() => step ?? initialState, [step]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export default StepConfigDrawerProvider;

export const useStepDrawerContext = () => useContext(Context);
