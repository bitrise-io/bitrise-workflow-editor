import { useMemo } from 'react';

import StepBundleService from '@/core/services/StepBundleService';
import WorkflowService from '@/core/services/WorkflowService';
import { useStepBundles } from '@/hooks/useStepBundles';
import { useWorkflows } from '@/hooks/useWorkflows';

type Props = {
  workflowId?: string;
  stepBundleCvs?: string;
};

const useDependantWorkflows = (props: Props) => {
  const { workflowId, stepBundleCvs } = props;
  const workflows = useWorkflows();
  const stepBundles = useStepBundles();

  return useMemo(() => {
    if (workflowId) {
      return WorkflowService.getDependantWorkflows(workflows, workflowId);
    }
    if (stepBundleCvs) {
      return StepBundleService.getDependantWorkflows(workflows, stepBundleCvs, stepBundles);
    }
    return [];
  }, [stepBundleCvs, stepBundles, workflowId, workflows]);
};

export default useDependantWorkflows;
