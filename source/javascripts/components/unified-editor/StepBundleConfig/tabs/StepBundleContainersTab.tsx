import ContainersTab from '@/components/unified-editor/ContainersTab/ContainersTab';
import { useStepBundleConfigContext } from '@/components/unified-editor/StepBundleConfig/StepBundleConfig.context';
import { ContainerType } from '@/core/models/Container';
import StepBundleService from '@/core/services/StepBundleService';

const StepBundleContainersTab = () => {
  const { stepBundle, stepBundleId, parentStepBundleId, parentWorkflowId, stepIndex } = useStepBundleConfigContext();

  const isDefaultMode = !parentStepBundleId && !parentWorkflowId;

  const at = {
    cvs: stepBundle?.cvs || `bundle::${stepBundle?.id}`,
    source: parentStepBundleId ? 'step_bundles' : ('workflows' as 'step_bundles' | 'workflows'),
    sourceId: parentStepBundleId || parentWorkflowId || '',
    stepIndex,
  };

  const handleAdd = (containerId: string, type: ContainerType) => {
    if (stepBundleId) {
      if (isDefaultMode) {
        StepBundleService.updateStepBundleField(stepBundleId, 'title', containerId + type);
      } else {
        StepBundleService.updateStepBundleInstanceField('title', containerId, at);
      }
    }
  };

  return <ContainersTab onAddContainer={handleAdd} />;
};

export default StepBundleContainersTab;
