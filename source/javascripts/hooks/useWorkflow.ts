import { Workflow } from '@/core/models/Workflow';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

function useWorkflow<U = Workflow | undefined>(id: string, selector?: (state: Workflow | undefined) => U) {
  return useBitriseYmlStore(({ yml }) => {
    const userValues = yml.workflows?.[id];
    const workflow = userValues ? { id, userValues } : undefined;

    return selector ? selector(workflow) : workflow;
  }) as U;
}

export default useWorkflow;
