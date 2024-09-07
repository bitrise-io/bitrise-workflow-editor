import { createContext, PropsWithChildren, useContext, useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import useStep from '@/hooks/useStep';
import { FormValues } from './StepConfigDrawer.types';

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
  const form = useForm<FormValues>({ mode: 'all' });
  const result = useStep(workflowId, stepIndex);
  const stepData = useMemo<State>(
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

  useEffect(() => {
    form.reset({
      properties: {
        name: result.data?.resolvedInfo?.title ?? '',
        version: result.data?.resolvedInfo?.normalizedVersion ?? '',
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result.data?.resolvedInfo?.title, result.data?.resolvedInfo?.normalizedVersion]);
  return (
    <Context.Provider value={stepData}>
      <FormProvider {...form}>{children}</FormProvider>
    </Context.Provider>
  );
};

export default StepConfigDrawerProvider;

export const useStepDrawerContext = () => useContext(Context);
