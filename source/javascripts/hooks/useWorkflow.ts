import { toMerged } from 'es-toolkit';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { Workflow } from '@/core/models/Workflow';

const useWorkflow = (id: string): Workflow | undefined => {
  return useBitriseYmlStore(({ yml, defaultMeta }) => {
    const workflow = yml.workflows?.[id];

    if (!workflow) {
      return undefined;
    }

    if (defaultMeta || workflow.meta) {
      workflow.meta = toMerged(defaultMeta || {}, workflow.meta || {});
    }

    return { id, userValues: workflow };
  });
};

export default useWorkflow;
