import { createContext, PropsWithChildren, useContext } from 'react';

import { Workflow } from '@/core/models/Workflow';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

const Context = createContext<string>('');

const WorkflowConfigProvider = ({ workflowId, children }: PropsWithChildren<{ workflowId: string }>) => {
  return <Context.Provider value={workflowId}>{children}</Context.Provider>;
};

export function useWorkflowConfigContext<U = Workflow | undefined>(selector?: (state: Workflow | undefined) => U) {
  const id = useContext(Context);

  return useBitriseYmlStore(({ yml }) => {
    const userValues = yml.workflows?.[id];
    const workflow = userValues ? { id, userValues } : undefined;

    return selector ? selector(workflow) : workflow;
  }) as U;
}

export default WorkflowConfigProvider;
