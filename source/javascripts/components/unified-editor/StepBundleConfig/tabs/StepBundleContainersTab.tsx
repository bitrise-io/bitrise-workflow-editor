import ContainersTab from '@/components/unified-editor/ContainersTab/ContainersTab';
import { useStepBundleConfigContext } from '@/components/unified-editor/StepBundleConfig/StepBundleConfig.context';
import { ContainerType } from '@/core/models/Container';
import StepBundleService from '@/core/services/StepBundleService';

type StepBundleContainersTabProps = {
  variant: 'panel' | 'drawer';
};

const StepBundleContainersTab = ({ variant }: StepBundleContainersTabProps) => {
  const { stepBundle, stepBundleId, parentStepBundleId, parentWorkflowId, stepIndex } = useStepBundleConfigContext();

  const defaultValues = stepBundle?.defaultValues ?? {};
  const userValues = stepBundle?.userValues ?? {};
  const mergedValues = stepBundle?.mergedValues ?? {};

  const isDefaultMode = !parentStepBundleId && !parentWorkflowId;

  const at = {
    cvs: stepBundle?.cvs || `bundle::${stepBundle?.id}`,
    source: parentStepBundleId ? 'step_bundles' : ('workflows' as 'step_bundles' | 'workflows'),
    sourceId: parentStepBundleId || parentWorkflowId || '',
    stepIndex,
  };

  const onAddContainer = (containerId: string, type: ContainerType) => {
    if (stepBundleId) {
      if (isDefaultMode) {
        StepBundleService.updateStepBundleField(stepBundleId, 'title', containerId + type);
      } else {
        StepBundleService.updateStepBundleInstanceField('title', containerId, at);
      }
    }
  };

  console.log({
    defaultValues,
    isDefaultMode,
    userValues,
    stepBundleId,
    mergedValues,
    at,
    parentStepBundleId,
    parentWorkflowId,
  });

  return (
    <ContainersTab
      onAddContainer={onAddContainer}
      source="step_bundles"
      sourceId={''}
      stepIndex={0}
      variant={variant}
    />
  );
};

export default StepBundleContainersTab;
