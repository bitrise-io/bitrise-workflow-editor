import { createContext, PropsWithChildren, useContext, useMemo } from 'react';
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

const StepConfigDrawerFormProvider = ({ step, children }: PropsWithChildren<{ step?: Step }>) => {
  const form = useForm<FormValues>({
    mode: 'all',
    defaultValues: {
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
    },
  });

  return <FormProvider {...form}>{children}</FormProvider>;
};

const StepConfigDrawerProvider = ({ children, workflowId, stepIndex }: PropsWithChildren<Props>) => {
  const result = useStep(workflowId, stepIndex);
  const step = result?.data as Step | undefined;

  const value = useMemo<State>(() => {
    if (!result) return initialState;
    return { workflowId, stepIndex, ...result } as State;
  }, [result, workflowId, stepIndex]);

  if (result.isLoading) {
    return null;
  }

  return (
    <Context.Provider value={value}>
      <StepConfigDrawerFormProvider step={step}>{children}</StepConfigDrawerFormProvider>
    </Context.Provider>
  );
};

export default StepConfigDrawerProvider;

export const useStepDrawerContext = () => useContext(Context);
