import { useShallow } from 'zustand/react/shallow';
import { Workflow } from '../../../models/BitriseYml';
import useBitriseYmlStore from './useBitriseYmlStore';

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
