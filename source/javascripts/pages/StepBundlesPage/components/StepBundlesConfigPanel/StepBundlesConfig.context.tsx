import { createContext, PropsWithChildren, useContext } from 'react';
import useStepBundle from '@/hooks/useStepBundle';
import { StepBundle } from '@/core/models/Step';

type State = StepBundle | undefined;
const Context = createContext<State>(undefined);

type Props = PropsWithChildren<{ stepBundleId: string }>;
const StepBundlesConfigProvider = ({ stepBundleId, children }: Props) => {
  const stepBundle = useStepBundle(stepBundleId);

  return <Context.Provider value={stepBundle as StepBundle}>{children}</Context.Provider>;
};

export const useWorkflowConfigContext = () => {
  return useContext<State>(Context);
};

export default StepBundlesConfigProvider;
