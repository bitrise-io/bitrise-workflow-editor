import { useShallow } from 'zustand/react/shallow';
import merge from 'lodash/merge';
import { Workflow } from '@/core/models/Workflow';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

const useWorkflow = (id: string): Workflow | undefined => {
  return useBitriseYmlStore(
    useShallow(({ yml, defaultMeta }) => {
      const workflow = yml.workflows?.[id];

      if (!workflow) {
        return;
      }

      if (defaultMeta || workflow.meta) {
        workflow.meta = merge({}, defaultMeta, workflow.meta);
      }

      return { id, ...workflow } as Workflow;
    }),
  );
};

export default useWorkflow;
