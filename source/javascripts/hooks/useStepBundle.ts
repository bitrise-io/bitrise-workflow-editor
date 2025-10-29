import { toMerged } from 'es-toolkit';

import { StepBundleInstance } from '@/core/models/Step';
import StepBundleService from '@/core/services/StepBundleService';
import StepService from '@/core/services/StepService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

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

  return useBitriseYmlStore(({ yml }) => {
    const { stepBundleId, parentWorkflowId, parentStepBundleId, stepIndex } = props;

    const result: UseStepBundleResult = { stepBundleId, parentWorkflowId, parentStepBundleId, stepIndex };

    if (stepBundleId) {
      const stepBundle = yml.step_bundles?.[stepBundleId];
      result.stepBundle = stepBundle ? StepBundleService.ymlInstanceToStepBundle(stepBundleId, stepBundle) : undefined;
      return result;
    }

    let stepListItemModel = undefined;

    if (parentWorkflowId) {
      stepListItemModel = yml.workflows?.[parentWorkflowId]?.steps?.[stepIndex];
    } else if (parentStepBundleId) {
      stepListItemModel = yml.step_bundles?.[parentStepBundleId]?.steps?.[stepIndex];
    }

    if (!stepListItemModel) {
      throw new Error(`StepBundle instance not found in the parent: ${parentWorkflowId || parentStepBundleId}`);
    }

    const [cvs, instance] = Object.entries(stepListItemModel ?? {})[0] ?? ['', {}];

    const id = StepBundleService.cvsToId(cvs);
    const stepBundle = toMerged(yml.step_bundles?.[id] ?? {}, instance ?? {});

    result.stepBundle = StepService.isStepBundle(cvs, defaultStepLibrary, stepBundle)
      ? StepBundleService.ymlInstanceToStepBundle(
          id,
          stepBundle,
          yml.step_bundles?.[id] || undefined,
          instance || undefined,
        )
      : undefined;
    result.stepBundleId = id;

    return result;
  });
};

export default useStepBundle;
