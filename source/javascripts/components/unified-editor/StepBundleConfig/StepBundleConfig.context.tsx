import { createContext, useContext } from 'react';

import { StepBundleInstance } from '@/core/models/Step';
import useStepBundle from '@/hooks/useStepBundle';

export type StepBundleConfigContextValue = {
  stepBundleId?: string;
  parentWorkflowId?: string;
  parentStepBundleId?: string;
  stepIndex: number;
};

export const StepBundleConfigContext = createContext<StepBundleConfigContextValue>({
  stepIndex: -1,
});

type UseStepBundleConfigContextResult = StepBundleConfigContextValue & {
  stepBundle?: StepBundleInstance;
};

// This function can work 3 different ways:
// 1. If stepBundleId is provided, it fetches the step bundle by its id.
// 2. If parentWorkflowId and stepIndex are provided, it fetches the stepBundle from the parentWorkflow at stepIndex.
// 3. If parentStepBundleId and stepIndex are provided, it fetches the stepBundle from the parentStepBundle at stepIndex.
export function useStepBundleConfigContext<U = UseStepBundleConfigContextResult>(
  selector?: (state: UseStepBundleConfigContextResult) => U,
): U {
  const context = useContext(StepBundleConfigContext);
  const result = useStepBundle(context);
  return selector ? selector(result as UseStepBundleConfigContextResult) : (result as U);
}
