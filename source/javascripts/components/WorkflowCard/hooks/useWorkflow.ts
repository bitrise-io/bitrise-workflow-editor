import { useShallow } from 'zustand/react/shallow';
import merge from 'lodash/merge';
import { Workflow } from '@/models/Workflow';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

type Props = {
  id: string;
};

const useWorkflow = ({ id }: Props): Workflow | undefined => {
  return useBitriseYmlStore(
    useShallow(({ yml, defaultMeta }) => {
      const workflow = yml.workflows?.[id];

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
