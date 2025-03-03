import { createContext, PropsWithChildren, useContext } from 'react';
import useStepBundle from '@/hooks/useStepBundle';
import { StepBundle } from '@/core/models/Step';
import useStep from '@/hooks/useStep';

type State = StepBundle | undefined;
const Context = createContext<State>(undefined);

type Props = PropsWithChildren<{ id?: string; stepBundleId?: string; stepIndex: number; workflowId?: string }>;
const StepBundleConfigProvider = ({ id, stepBundleId, children, stepIndex, workflowId }: Props) => {
  const stepLike = useStep({ stepBundleId, stepIndex, workflowId });

  const stepBundle = useStepBundle(id || stepLike?.data?.id || '');

  return <Context.Provider value={stepBundle as StepBundle}>{children}</Context.Provider>;
};

export const useStepBundleConfigContext = () => {
  return useContext<State>(Context);
};

export default StepBundleConfigProvider;
