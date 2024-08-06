import { useShallow } from 'zustand/react/shallow';
import merge from 'lodash/merge';
import { Workflow } from '@/models/Workflow';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

const useWorkflow = (workflowId: string): Workflow | undefined => {
  return useBitriseYmlStore(
    useShallow(({ yml, defaultMeta }) => {
      const workflow = yml.workflows?.[workflowId];

      if (!workflow) {
        return;
      }

      if (defaultMeta || workflow.meta) {
        workflow.meta = merge({}, defaultMeta, workflow.meta);
      }

      return workflow;
    }),
  );
};

export default useWorkflow;
