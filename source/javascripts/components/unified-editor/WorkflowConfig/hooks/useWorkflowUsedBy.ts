import { useShallow } from 'zustand/react/shallow';
import WorkflowService from '@/core/models/WorkflowService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

const useWorkflowUsedBy = (workflowId: string) => {
  return useBitriseYmlStore(
    useShallow(({ yml }) => WorkflowService.getDependantWorkflows(yml.workflows ?? {}, workflowId)),
  );
};

export default useWorkflowUsedBy;
