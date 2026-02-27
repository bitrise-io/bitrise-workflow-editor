import { createContext, PropsWithChildren, useContext } from 'react';

import { Workflow } from '@/core/models/Workflow';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useMergedBitriseYml from '@/hooks/useMergedBitriseYml';

const Context = createContext<string>('');

const WorkflowConfigProvider = ({ workflowId, children }: PropsWithChildren<{ workflowId: string }>) => {
  return <Context.Provider value={workflowId}>{children}</Context.Provider>;
};

export function useWorkflowConfigContext<U = Workflow | undefined>(selector?: (state: Workflow | undefined) => U) {
  const id = useContext(Context);
  const mergedYml = useMergedBitriseYml();

  return useBitriseYmlStore(({ yml }) => {
    const userValues = yml.workflows?.[id] ?? mergedYml?.workflows?.[id];
    const workflow = userValues ? { id, userValues } : undefined;

    return selector ? selector(workflow) : workflow;
  }) as U;
}

export default WorkflowConfigProvider;
