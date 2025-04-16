import { createContext, PropsWithChildren, useContext, useMemo } from 'react';

import { StepBundle } from '@/core/models/Step';
import useStep from '@/hooks/useStep';
import useStepBundle from '@/hooks/useStepBundle';

type State = { stepBundle: StepBundle | undefined } & Props;
const Context = createContext<State>({
  stepBundle: undefined,
  stepIndex: -1,
});

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
const StepBundleConfigProvider = (props: Props) => {
  const { stepBundleId, parentWorkflowId, parentStepBundleId, children, stepIndex } = props;
  const stepLike = useStep({ stepBundleId: parentStepBundleId, stepIndex, workflowId: parentWorkflowId });

  const stepBundle = useStepBundle(stepBundleId || stepLike?.data?.id || '');

  const contextValue = useMemo(() => ({ stepBundle, ...props }), [stepBundle, props]);

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
};

export const useStepBundleConfigContext = () => {
  return useContext<State>(Context);
};

export default StepBundleConfigProvider;
