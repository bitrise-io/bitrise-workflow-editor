import { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import useStepBundle from '@/hooks/useStepBundle';
import { StepBundle } from '@/core/models/Step';
import useStep from '@/hooks/useStep';

type Props = PropsWithChildren<{ id?: string; stepBundleId?: string; stepIndex: number; workflowId?: string }>;

type State = { stepBundle: StepBundle | undefined } & Props;
const Context = createContext<State>({
  stepBundle: undefined,
  stepIndex: -1,
});

const StepBundleConfigProvider = (props: Props) => {
  const { children, id, stepBundleId, stepIndex, workflowId } = props;

  const stepLike = useStep({ stepBundleId, stepIndex, workflowId });

  const stepBundle = useStepBundle(id || stepLike?.data?.id || '');

  const contextValue = useMemo(() => ({ stepBundle, ...props }), [stepBundle, props]);

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
};

export const useStepBundleConfigContext = () => {
  return useContext<State>(Context);
};

export default StepBundleConfigProvider;
