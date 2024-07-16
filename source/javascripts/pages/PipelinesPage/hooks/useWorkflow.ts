import { useShallow } from 'zustand/react/shallow';
import { Workflow } from '@/models/Workflow';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

type Props = {
  id: string;
};

const useWorkflow = ({ id }: Props): Workflow => {
  return useBitriseYmlStore(
    useShallow(({ yml }) => {
      return yml.workflows?.[id] ?? {};
    }),
  );
};

export default useWorkflow;
