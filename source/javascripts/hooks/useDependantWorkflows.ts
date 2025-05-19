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

  const workflows = useWorkflows((s) => {
    return Object.fromEntries(
      Object.entries(s).map(([id, { before_run, after_run }]) => {
        return [id, { before_run, after_run }];
      }),
    );
  });

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
