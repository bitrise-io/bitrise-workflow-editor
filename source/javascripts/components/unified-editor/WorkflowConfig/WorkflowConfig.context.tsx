import { createContext, PropsWithChildren, useContext } from 'react';

import { Workflow } from '@/core/models/Workflow';
import useWorkflow from '@/hooks/useWorkflow';

type State = Workflow | undefined;
const Context = createContext<State>(undefined);

type Props = PropsWithChildren<{ workflowId: string }>;
const WorkflowConfigProvider = ({ workflowId, children }: Props) => {
  const workflow = useWorkflow(workflowId);

  return <Context.Provider value={workflow}>{children}</Context.Provider>;
};

export const useWorkflowConfigContext = () => {
  return useContext<State>(Context);
};

export default WorkflowConfigProvider;
