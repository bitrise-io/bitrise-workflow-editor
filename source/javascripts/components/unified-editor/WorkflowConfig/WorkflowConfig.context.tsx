import { createContext, useContext } from 'react';

import { Workflow } from '@/core/models/Workflow';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

// Component (WorkflowConfigProvider) and hook are kept in separate modules so
// this file exports only non-components — otherwise React Fast Refresh treats
// the mixed module as a non-boundary and falls back to a full page reload.
export const WorkflowConfigContext = createContext<string>('');

/**
 * The raw workflow id the drawer was opened for — available even when the
 * workflow isn't defined in the active file (a cross-file reference), unlike
 * `useWorkflowConfigContext` which resolves to `undefined` in that case.
 */
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
