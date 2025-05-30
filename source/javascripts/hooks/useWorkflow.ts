import { Workflow } from '@/core/models/Workflow';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

const useWorkflow = (id: string): Workflow | undefined => {
  return useBitriseYmlStore(({ yml }) => {
    const workflow = yml.workflows?.[id];

    if (!workflow) {
      return undefined;
    }

    return { id, userValues: workflow };
  });
};

export default useWorkflow;
