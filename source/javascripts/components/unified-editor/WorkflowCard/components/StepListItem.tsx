/* eslint-disable import/no-cycle */
import StepBundleCard from '@/components/unified-editor/StepSelectorDrawer/components/StepBundleCard';
import StepCard, { StepCardProps } from '@/components/unified-editor/WorkflowCard/components/StepCard';
import StepService from '@/core/models/StepService';
import useDefaultStepLibrary from '@/hooks/useDefaultStepLibrary';
import useStep from '@/hooks/useStep';

const StepListItem = (props: StepCardProps) => {
  const { stepBundleId, stepIndex, workflowId = '', ...rest } = props;
  const { data } = useStep({ workflowId, stepIndex });
  const defaultStepLibrary = useDefaultStepLibrary();

  const isStepBundle = StepService.isStepBundle(data?.cvs || '', defaultStepLibrary, data?.userValues);

  if (isStepBundle) {
    return <StepBundleCard stepBundleId={data.id} isCollapsable />;
  }

  return <StepCard stepIndex={stepIndex} stepBundleId={stepBundleId} workflowId={workflowId} {...rest} />;
};

export default StepListItem;
