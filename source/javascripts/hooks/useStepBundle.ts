import { toMerged } from 'es-toolkit';

import { StepBundleInstance } from '@/core/models/Step';
import StepBundleService from '@/core/services/StepBundleService';
import StepService from '@/core/services/StepService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useMergedBitriseYml from '@/hooks/useMergedBitriseYml';

import useDefaultStepLibrary from './useDefaultStepLibrary';

type UseStepBundleResult = Props & {
  stepBundle?: StepBundleInstance;
};

type Props = {
  stepBundleId?: string;
  parentWorkflowId?: string;
  parentStepBundleId?: string;
  stepIndex: number;
};

const useStepBundle = (props: Props) => {
  const defaultStepLibrary = useDefaultStepLibrary();
  const mergedYml = useMergedBitriseYml();

  return useBitriseYmlStore(({ yml }) => {
    const { stepBundleId, parentWorkflowId, parentStepBundleId, stepIndex } = props;
    const allStepBundles = mergedYml?.step_bundles
      ? { ...mergedYml.step_bundles, ...(yml.step_bundles || {}) }
      : yml.step_bundles || {};

    const result: UseStepBundleResult = { stepBundleId, parentWorkflowId, parentStepBundleId, stepIndex };

    if (stepBundleId) {
      const stepBundle = allStepBundles?.[stepBundleId];
      result.stepBundle = stepBundle ? StepBundleService.ymlInstanceToStepBundle(stepBundleId, stepBundle) : undefined;
      return result;
    }

    let stepListItemModel = undefined;

    if (parentWorkflowId) {
      const workflows = mergedYml?.workflows
        ? { ...mergedYml.workflows, ...(yml.workflows || {}) }
        : yml.workflows || {};
      stepListItemModel = workflows?.[parentWorkflowId]?.steps?.[stepIndex];
    } else if (parentStepBundleId) {
      stepListItemModel = allStepBundles?.[parentStepBundleId]?.steps?.[stepIndex];
    }

    const [cvs, instance] = Object.entries(stepListItemModel ?? {})[0] ?? ['', {}];

    const id = StepBundleService.cvsToId(cvs);
    const stepBundle = toMerged(allStepBundles?.[id] ?? {}, instance ?? {});

    result.stepBundle = StepService.isStepBundle(cvs, defaultStepLibrary, stepBundle)
      ? StepBundleService.ymlInstanceToStepBundle(
          id,
          stepBundle,
          allStepBundles?.[id] || undefined,
          instance || undefined,
        )
      : undefined;
    result.stepBundleId = id;

    return result;
  });
};

export default useStepBundle;
