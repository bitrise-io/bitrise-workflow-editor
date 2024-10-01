import { createContext, PropsWithChildren, useContext, useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import omit from 'lodash/omit';
import useStep from '@/hooks/useStep';
import { Step } from '@/core/models/Step';
import { FormValues } from './StepConfigDrawer.types';

type Props = { workflowId: string; stepIndex: number };
type State = {
  workflowId: string;
  stepIndex: number;
  isLoading: boolean;
  data?: Step;
};

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
    return { workflowId, stepIndex, ...result } as State;
  }, [result, workflowId, stepIndex]);

  useEffect(() => {
    if (result.isLoading) {
      return;
    }

    const step = result.data as Step;
    form.reset({
      configuration: {
        is_always_run: step?.mergedValues?.is_always_run ?? false,
        is_skippable: step?.mergedValues?.is_skippable ?? false,
        run_if: step?.mergedValues?.run_if ?? '',
      },
      properties: {
        name: step?.title ?? '',
        version: step?.resolvedInfo?.normalizedVersion ?? '',
      },
      inputs: step?.mergedValues?.inputs?.reduce((acc, input) => {
        return { ...acc, ...omit(input, 'opts') };
      }, {}),
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
