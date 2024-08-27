import { useShallow } from 'zustand/react/shallow';
import WorkflowService from '@/core/models/WorkflowService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

const useWorkflowDependants = (workflowId: string) => {
  return useBitriseYmlStore(
    useShallow(({ yml }) => WorkflowService.getDependantWorkflows(yml.workflows ?? {}, workflowId)),
  );
};

export default useWorkflowDependants;
