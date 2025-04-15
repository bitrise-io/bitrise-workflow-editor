import { EnvModel } from '@/core/models/BitriseYml';
import useStep from '@/hooks/useStep';

import { InputListItem } from '../types/StepBundle.types';
import { expandInput } from '../utils/StepBundle.utils';

type Props = {
  inputs?: EnvModel;
  parentStepBundleId?: string;
  parentWorkflowId?: string;
  stepIndex: number;
};

const useStepBundleInputs = (props: Props) => {
  const { inputs, parentStepBundleId, parentWorkflowId, stepIndex } = props;

  const stepLike = useStep({ stepBundleId: parentStepBundleId, stepIndex, workflowId: parentWorkflowId });

  const categories: Record<string, InputListItem[]> = {
    uncategorized: [],
  };

  if (!inputs) {
    return categories;
  }

  inputs.forEach((input, index) => {
    const { key } = expandInput(input);
    const instanceValueObject = stepLike.data?.userValues.inputs?.find(({ opts, ...i }) => Object.keys(i)[0] === key);
    const instanceValue = Object.values(instanceValueObject || {})[0] as string;
    if (input?.opts?.category) {
      categories[input.opts.category] = categories[input.opts.category] || [];
      categories[input.opts.category].push({
        input,
        index,
        instanceValue,
      });
    } else {
      categories.uncategorized.push({ input, index, instanceValue });
    }
  });

  return categories;
};

export default useStepBundleInputs;
