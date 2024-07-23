import { useShallow } from 'zustand/react/shallow';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

const useWorkflowIds = () => {
  return useBitriseYmlStore(useShallow(({ yml }) => Object.keys(yml.workflows ?? {})));
};

export default useWorkflowIds;
