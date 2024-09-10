import { createContext, PropsWithChildren, useContext, useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import useStep from '@/hooks/useStep';
import { FormValues } from './StepConfigDrawer.types';

type Props = { workflowId: string; stepIndex: number };
type State = {
  workflowId: string;
  stepIndex: number;
} & ReturnType<typeof useStep>;

const initialState: State = {
  data: undefined,
  isLoading: false,
  workflowId: '',
  stepIndex: 0,
};
const Context = createContext<State>(initialState);

const StepConfigDrawerProvider = ({ children, workflowId, stepIndex }: PropsWithChildren<Props>) => {
  const result = useStep(workflowId, stepIndex);
  const form = useForm<FormValues>({ mode: 'all' });

  const value = useMemo<State>(() => {
    if (!result) return initialState;
    return { workflowId, stepIndex, ...result };
  }, [result, workflowId, stepIndex]);

  useEffect(() => {
    if (result.isLoading) {
      return;
    }

    form.reset({
      configuration: {
        is_always_run: result?.data?.mergedValues?.is_always_run ?? false,
        is_skippable: result?.data?.mergedValues?.is_skippable ?? false,
        run_if: result?.data?.mergedValues?.run_if ?? '',
      },
      properties: {
        name: result?.data?.resolvedInfo?.title ?? '',
        version: result?.data?.resolvedInfo?.normalizedVersion ?? '',
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflowId, stepIndex, result.isLoading]);
  return (
    <Context.Provider value={value}>
      <FormProvider {...form}>{children}</FormProvider>
    </Context.Provider>
  );
};

export default StepConfigDrawerProvider;

export const useStepDrawerContext = () => useContext(Context);
