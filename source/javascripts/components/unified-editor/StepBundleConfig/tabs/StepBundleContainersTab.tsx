import ContainersTab from '@/components/unified-editor/ContainersTab/ContainersTab';
import { useStepBundleConfigContext } from '@/components/unified-editor/StepBundleConfig/StepBundleConfig.context';
import { ContainerType } from '@/core/models/Container';
import ContainerService from '@/core/services/ContainerService';
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

  console.log(at);

  const handleAdd = (containerId: string, type: ContainerType) => {
    if (stepBundleId) {
      if (isDefaultMode) {
        StepBundleService.updateStepBundleField(stepBundleId, 'title', containerId + type);
      } else {
        ContainerService.addContainerReference(
          parentStepBundleId ? 'step_bundles' : 'workflows',
          parentStepBundleId || parentWorkflowId || '',
          stepIndex,
          containerId,
        );
      }
    }
  };

  return <ContainersTab onAddContainer={handleAdd} />;
};

export default StepBundleContainersTab;
