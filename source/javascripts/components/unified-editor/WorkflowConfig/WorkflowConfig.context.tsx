import { createContext, useContext } from 'react';

import { Workflow } from '@/core/models/Workflow';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

export const WorkflowConfigContext = createContext<string>('');

// Resolves even for a cross-file workflow, unlike useWorkflowConfigContext (which reads local yml).
export function useWorkflowConfigId() {
  return useContext(WorkflowConfigContext);
}

export function useWorkflowConfigContext<U = Workflow | undefined>(selector?: (state: Workflow | undefined) => U) {
  const id = useContext(WorkflowConfigContext);

  return useBitriseYmlStore(({ yml }) => {
    const userValues = yml.workflows?.[id];
    const workflow = userValues ? { id, userValues } : undefined;

    return selector ? selector(workflow) : workflow;
  }) as U;
}
