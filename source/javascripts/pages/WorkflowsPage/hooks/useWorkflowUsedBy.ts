import { useShallow } from 'zustand/react/shallow';
import { extractUsedByWorkflows } from '@/models/Workflow';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

const useWorkflowUsedBy = (workflowId: string) => {
  return useBitriseYmlStore(useShallow(({ yml }) => extractUsedByWorkflows(yml.workflows ?? {}, workflowId)));
};

export default useWorkflowUsedBy;
