import { useMemo } from 'react';
import { useWorkflows } from '@/hooks/useWorkflows';
import WorkflowService from '@/core/models/WorkflowService';
import StepBundleService from '@/core/models/StepBundleService';

type Props = {
  workflowId?: string;
  stepBundleId?: string;
};

const useDependantWorkflows = (props: Props) => {
  const { workflowId, stepBundleId } = props;
  const workflows = useWorkflows();

  return useMemo(() => {
    if (workflowId) {
      return WorkflowService.getDependantWorkflows(workflows, workflowId);
    }
    if (stepBundleId) {
      return StepBundleService.getDependantWorkflows(workflows, stepBundleId);
    }
    return [];
  }, [stepBundleId, workflowId, workflows]);
};

export default useDependantWorkflows;
