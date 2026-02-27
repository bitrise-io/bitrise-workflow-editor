import { Workflow } from '@/core/models/Workflow';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useMergedBitriseYml from '@/hooks/useMergedBitriseYml';

function useWorkflow<U = Workflow | undefined>(id: string, selector?: (state: Workflow | undefined) => U) {
  const mergedYml = useMergedBitriseYml();

  return useBitriseYmlStore(({ yml }) => {
    const userValues = yml.workflows?.[id] ?? mergedYml?.workflows?.[id];
    const workflow = userValues ? { id, userValues } : undefined;

    return selector ? selector(workflow) : workflow;
  }) as U;
}

export default useWorkflow;
