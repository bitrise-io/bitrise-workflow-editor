import { useShallow } from 'zustand/react/shallow';
import { extractUsedByWorkflows } from '@/models/Workflow';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

type Props = {
  id: string;
};

const useWorkflowUsedBy = ({ id }: Props) => {
  return useBitriseYmlStore(useShallow(({ yml }) => extractUsedByWorkflows(yml.workflows ?? {}, id)));
};

export default useWorkflowUsedBy;
