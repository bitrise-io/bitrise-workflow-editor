import { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import useStep from '@/hooks/useStep';

type Props = { workflowId: string; stepIndex: number };
type State = { workflowId: string; stepIndex: number } & ReturnType<typeof useStep>;

const initialState: State = {
  data: undefined,
  isLoading: false,
  workflowId: '',
  stepIndex: 0,
};
const Context = createContext<State>(initialState);

const StepConfigDrawerProvider = ({ children, workflowId, stepIndex }: PropsWithChildren<Props>) => {
  const result = useStep(workflowId, stepIndex);
  const value = useMemo<State>(
    () =>
      result
        ? {
            workflowId,
            stepIndex,
            ...result,
          }
        : initialState,
    [workflowId, stepIndex, result],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export default StepConfigDrawerProvider;

export const useStepDrawerContext = () => useContext(Context);
