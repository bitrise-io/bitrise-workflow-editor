import { createContext, useContext } from 'react';

import { Workflow } from '@/core/models/Workflow';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

// Provider component kept in a separate module so this file exports only non-components, keeping React Fast Refresh happy (a mixed module forces a full reload).
export const WorkflowConfigContext = createContext<string>('');

/** Raw workflow id the drawer was opened for — resolves even for a cross-file reference, unlike `useWorkflowConfigContext`. */
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
