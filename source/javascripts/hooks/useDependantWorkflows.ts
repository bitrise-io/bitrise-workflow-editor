import { mapValues } from 'es-toolkit';
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
      Object.entries(s).map(([id, wf]) => {
        return [
          id,
          {
            before_run: wf?.before_run,
            steps: wf?.steps?.map((step) => mapValues(step, () => ({}))),
            after_run: wf?.after_run,
          },
        ];
      }),
    );
  });

  const stepBundles = useStepBundles((s) => {
    return Object.fromEntries(
      Object.entries(s).map(([id, stepBundle]) => {
        return [id, { steps: stepBundle?.steps }];
      }),
    );
  });

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
