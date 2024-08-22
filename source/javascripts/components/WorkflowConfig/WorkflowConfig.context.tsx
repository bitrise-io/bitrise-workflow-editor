import { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import useWorkflow from '@/hooks/useWorkflow';

type Props = PropsWithChildren<{ workflowId: string }>;
type State = Exclude<ReturnType<typeof useWorkflow>, undefined>;

const initialState: State = { id: '' };
const Context = createContext<State>(initialState);

const WorkflowConfigProvider = ({ workflowId, children }: Props) => {
  const workflow = useWorkflow(workflowId);
  const value = useMemo(() => workflow ?? initialState, [workflow]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const useWorkflowConfigContext = () => {
  return useContext(Context);
};

export default WorkflowConfigProvider;
