import { createContext, PropsWithChildren, useContext } from 'react';
import useStepBundle from '@/hooks/useStepBundle';

// TODO: Add StepBundle | undefined type to State
type State = any;
const Context = createContext<State>(undefined);

type Props = PropsWithChildren<{ stepBundleId: string }>;
const StepBundlesConfigProvider = ({ stepBundleId, children }: Props) => {
  const stepBundle = useStepBundle(stepBundleId);

  return <Context.Provider value={stepBundle}>{children}</Context.Provider>;
};

export const useWorkflowConfigContext = () => {
  return useContext<State>(Context);
};

export default StepBundlesConfigProvider;
