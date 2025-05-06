import { createContext, PropsWithChildren, useContext } from 'react';

import { Workflow } from '@/core/models/Workflow';
import useWorkflow from '@/hooks/useWorkflow';

const Context = createContext<Workflow | undefined>(undefined);

const WorkflowConfigProvider = ({ workflowId, children }: PropsWithChildren<{ workflowId: string }>) => {
  const workflow = useWorkflow(workflowId);

  return <Context.Provider value={workflow}>{children}</Context.Provider>;
};

export const useWorkflowConfigContext = () => {
  return useContext<Workflow | undefined>(Context);
};

export default WorkflowConfigProvider;
