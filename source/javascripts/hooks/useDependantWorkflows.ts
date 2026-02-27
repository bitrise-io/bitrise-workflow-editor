import { mapValues } from 'es-toolkit';
import { useMemo } from 'react';

import StepBundleService from '@/core/services/StepBundleService';
import WorkflowService from '@/core/services/WorkflowService';
import useMergedBitriseYml from '@/hooks/useMergedBitriseYml';
import { useStepBundles } from '@/hooks/useStepBundles';
import { useWorkflows } from '@/hooks/useWorkflows';

type Props = {
  workflowId?: string;
  stepBundleCvs?: string;
};

const useDependantWorkflows = (props: Props) => {
  const { workflowId, stepBundleCvs } = props;
  const mergedYml = useMergedBitriseYml();

  // Use merged workflows for accurate dependency counting across all files
  const workflows = useWorkflows((s) => {
    const allWorkflows = mergedYml?.workflows ? { ...mergedYml.workflows, ...s } : s;
    return Object.fromEntries(
      Object.entries(allWorkflows).map(([id, wf]) => {
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

  // Use merged step bundles for accurate dependency counting
  const stepBundles = useStepBundles({ withMerged: true }, (s) => {
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
