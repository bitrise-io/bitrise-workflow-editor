import { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import useWorkflow from '@/hooks/useWorkflow';
import { Workflow } from '@/core/models/Workflow';

type State = Workflow | undefined;
const Context = createContext<State>(undefined);

type Props = PropsWithChildren<{ workflowId: string }>;
const WorkflowConfigProvider = ({ workflowId, children }: Props) => {
  const result = useWorkflow(workflowId);
  const value = useMemo(() => result, [result]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const useWorkflowConfigContext = () => {
  return useContext<State>(Context);
};

export default WorkflowConfigProvider;
