import ContainersTab from '@/components/unified-editor/ContainersTab/ContainersTab';
import useContainerReferences from '@/components/unified-editor/ContainersTab/hooks/useContainerReferences';
import { useStepBundleConfigContext } from '@/components/unified-editor/StepBundleConfig/StepBundleConfig.context';
import { ContainerType } from '@/core/models/Container';
import ContainerService from '@/core/services/ContainerService';
import useContainers from '@/hooks/useContainers';

const StepBundleContainersTab = () => {
  const { stepBundleId, parentStepBundleId, parentWorkflowId, stepIndex } = useStepBundleConfigContext();

  const isDefinition = !parentStepBundleId && !parentWorkflowId;
  const source = parentWorkflowId ? 'workflows' : 'step_bundles';
  const sourceId = parentStepBundleId || parentWorkflowId || '';

  const handleAdd = (containerId: string, type: ContainerType) => {
    if (stepBundleId) {
      if (isDefinition) {
        ContainerService.addContainerReference('step_bundles', stepBundleId, -1, containerId, type);
      } else {
        ContainerService.addContainerReference(source, sourceId, stepIndex, containerId, type);
      }
    }
  };

  const handleRecreate = (containerId: string, recreate: boolean, type: ContainerType) => {
    if (stepBundleId) {
      if (isDefinition) {
        ContainerService.updateContainerReferenceRecreate(
          'step_bundles',
          stepBundleId,
          -1,
          containerId,
          type,
          recreate,
        );
      } else {
        ContainerService.updateContainerReferenceRecreate(source, sourceId, stepIndex, containerId, type, recreate);
      }
    }
  };

  const handleRemove = (containerId: string, type: ContainerType) => {
    if (stepBundleId) {
      if (isDefinition) {
        ContainerService.removeContainerReference('step_bundles', stepBundleId, -1, containerId, type);
      } else {
        ContainerService.removeContainerReference(source, sourceId, stepIndex, containerId, type);
      }
    }
  };

  const {
    [ContainerType.Execution]: executionContainers,
    [ContainerType.Service]: serviceContainers,
    withoutType: otherContainers,
  } = useContainers();

  const references = useContainerReferences(source, sourceId || '', stepIndex, stepBundleId);

  return (
    <ContainersTab
      executionContainers={[...executionContainers, ...otherContainers]}
      references={references}
      serviceContainers={[...serviceContainers, ...otherContainers]}
      onAddContainer={handleAdd}
      onRecreate={handleRecreate}
      onRemove={handleRemove}
      isDefinitionReferencesDisabled={!isDefinition}
    />
  );
};

export default StepBundleContainersTab;
