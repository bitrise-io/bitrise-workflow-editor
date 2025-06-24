import { toMerged } from 'es-toolkit';
import { createContext, PropsWithChildren, useContext } from 'react';

import { StepBundleInstance } from '@/core/models/Step';
import StepBundleService from '@/core/services/StepBundleService';
import StepService from '@/core/services/StepService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useDefaultStepLibrary from '@/hooks/useDefaultStepLibrary';

type Props = PropsWithChildren<{
  stepBundleId?: string;
  parentWorkflowId?: string;
  parentStepBundleId?: string;
  stepIndex: number;
}>;

const Context = createContext<Omit<Props, 'children'>>({
  stepIndex: -1,
});

const StepBundleConfigProvider = ({ children, ...props }: Props) => {
  return <Context.Provider value={props}>{children}</Context.Provider>;
};

type UseStepBundleConfigContextResult = Omit<Props, 'children'> & {
  stepBundle?: StepBundleInstance;
};

// This function can work 3 different ways:
// 1. If stepBundleId is provided, it fetches the step bundle by its id.
// 2. If parentWorkflowId and stepIndex are provided, it fetches the stepBundle from the parentWorkflow at stepIndex.
// 3. If parentStepBundleId and stepIndex are provided, it fetches the stepBundle from the parentStepBundle at stepIndex.
export function useStepBundleConfigContext<U = UseStepBundleConfigContextResult>(
  selector?: (state: UseStepBundleConfigContextResult) => U,
): U {
  const defaultStepLibrary = useDefaultStepLibrary();
  const { stepBundleId, parentWorkflowId, parentStepBundleId, stepIndex } = useContext(Context);

  return useBitriseYmlStore(({ yml }) => {
    const result: UseStepBundleConfigContextResult = { stepBundleId, parentWorkflowId, parentStepBundleId, stepIndex };

    if (stepBundleId) {
      const stepBundle = yml.step_bundles?.[stepBundleId];
      result.stepBundle = stepBundle ? StepBundleService.ymlInstanceToStepBundle(stepBundleId, stepBundle) : undefined;
    }

    if (!stepBundleId && parentWorkflowId && stepIndex >= 0) {
      const stepListItemModel = yml.workflows?.[parentWorkflowId]?.steps?.[stepIndex];
      const [cvs, stepBundleInWorkflow] = Object.entries(stepListItemModel || {})[0];

      const id = StepBundleService.cvsToId(cvs);
      const stepBundle = toMerged(yml.step_bundles?.[id] ?? {}, stepBundleInWorkflow ?? {});

      result.stepBundle = StepService.isStepBundle(cvs, defaultStepLibrary, stepBundle)
        ? StepBundleService.ymlInstanceToStepBundle(
            id,
            stepBundle,
            yml.step_bundles?.[id] || undefined,
            stepBundleInWorkflow || undefined,
          )
        : undefined;
    }

    if (!stepBundleId && !parentWorkflowId && parentStepBundleId && stepIndex >= 0) {
      const stepListItemModel = yml.step_bundles?.[parentStepBundleId]?.steps?.[stepIndex];
      const [cvs, stepBundleInStepBundle] = Object.entries(stepListItemModel || {})[0];

      const id = StepBundleService.cvsToId(cvs);
      const stepBundle = toMerged(yml.step_bundles?.[id] ?? {}, stepBundleInStepBundle ?? {});

      result.stepBundle = StepService.isStepBundle(cvs, defaultStepLibrary, stepBundle)
        ? StepBundleService.ymlInstanceToStepBundle(
            id,
            stepBundle,
            yml.step_bundles?.[id] || undefined,
            stepBundleInStepBundle || undefined,
          )
        : undefined;
    }

    return selector ? selector(result) : result;
  }) as U;
}

export default StepBundleConfigProvider;
