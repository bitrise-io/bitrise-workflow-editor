import { createContext, PropsWithChildren, useContext } from 'react';
import useStepBundle from '@/hooks/useStepBundle';
import { StepBundle } from '@/core/models/Step';
import useStep from '@/hooks/useStep';

type State = StepBundle | undefined;
const Context = createContext<State>(undefined);

type Props = PropsWithChildren<{
  stepBundleId?: string;
  parentWorkflowId?: string;
  parentStepBundleId?: string;
  stepIndex: number;
}>;

// This function can work 3 different ways:
// 1. If stepBundleId is provided, it fetches the step bundle by its id.
// 2. If parentWorkflowId and stepIndex are provided, it fetches the stepBundle from the parentWorkflow at stepIndex.
// 3. If parentStepBundleId and stepIndex are provided, it fetches the stepBundle from the parentStepBundle at stepIndex.
const StepBundleConfigProvider = ({
  stepBundleId,
  parentWorkflowId,
  parentStepBundleId,
  children,
  stepIndex,
}: Props) => {
  const stepLike = useStep({ stepBundleId: parentStepBundleId, stepIndex, workflowId: parentWorkflowId });

  const stepBundle = useStepBundle(stepBundleId || stepLike?.data?.id || '');

  return <Context.Provider value={stepBundle as StepBundle}>{children}</Context.Provider>;
};

export const useStepBundleConfigContext = () => {
  return useContext<State>(Context);
};

export default StepBundleConfigProvider;
