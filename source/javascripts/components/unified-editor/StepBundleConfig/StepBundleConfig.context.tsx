import { createContext, PropsWithChildren, useContext } from 'react';

import { StepBundleInstance } from '@/core/models/Step';
import useStepBundleInstance from '@/hooks/useStepBundleInstance';

import StepConfigDrawerProvider from '../StepConfigDrawer/StepConfigDrawer.context';

type Props = PropsWithChildren<{
  stepBundleId?: string;
  parentWorkflowId?: string;
  parentStepBundleId?: string;
  stepIndex: number;
}>;

const Context = createContext<Omit<Props, 'children'>>({
  stepIndex: -1,
});

const StepBundleConfigProvider = ({ children, ...props }: Props) => {
  return (
    <StepConfigDrawerProvider stepBundleId={props.stepBundleId} workflowId="" stepIndex={props.stepIndex}>
      <Context.Provider value={props}>{children}</Context.Provider>
    </StepConfigDrawerProvider>
  );
};

type UseStepBundleConfigContextResult = Omit<Props, 'children'> & {
  stepBundle?: StepBundleInstance;
};

// This function can work 3 different ways:
// 1. If stepBundleId is provided, it fetches the step bundle by its id.
// 2. If parentWorkflowId and stepIndex are provided, it fetches the stepBundle from the parentWorkflow at stepIndex.
// 3. If parentStepBundleId and stepIndex are provided, it fetches the stepBundle from the parentStepBundle at stepIndex.
export function useStepBundleConfigContext<U = UseStepBundleConfigContextResult>(
  selector?: (state: UseStepBundleConfigContextResult) => U,
): U {
  const context = useContext(Context);
  const result = useStepBundleInstance(context);
  return selector ? selector(result as UseStepBundleConfigContextResult) : (result as U);
}

export default StepBundleConfigProvider;
