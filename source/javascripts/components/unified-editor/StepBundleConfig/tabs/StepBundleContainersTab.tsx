import ContainersTab from '@/components/unified-editor/ContainersTab/ContainersTab';
import { useStepBundleConfigContext } from '@/components/unified-editor/StepBundleConfig/StepBundleConfig.context';
import useContainerReferences from '@/components/unified-editor/StepConfigDrawer/useContainerReferences';
import { ContainerType } from '@/core/models/Container';
import ContainerService from '@/core/services/ContainerService';
import useContainers from '@/hooks/useContainers';

const StepBundleContainersTab = () => {
  const { stepBundleId, parentStepBundleId, parentWorkflowId, stepIndex } = useStepBundleConfigContext();

  const isDefaultMode = !parentStepBundleId && !parentWorkflowId;
  const source = parentWorkflowId ? 'workflows' : 'step_bundles';
  const sourceId = parentStepBundleId || parentWorkflowId || '';

  const handleAdd = (containerId: string) => {
    if (stepBundleId) {
      if (isDefaultMode) {
        ContainerService.addContainerReference('step_bundles', stepBundleId, -1, containerId);
      } else {
        ContainerService.addContainerReference(source, sourceId, stepIndex, containerId);
      }
    }
  };

  const executionContainers = useContainers((containers) => {
    return ContainerService.getAllContainers(containers, (c) => c.userValues.type === ContainerType.Execution);
  });
  const serviceContainers = useContainers((containers) => {
    return ContainerService.getAllContainers(containers, (c) => c.userValues.type === ContainerType.Service);
  });

  const executionReferences = useContainerReferences(
    source,
    sourceId || stepBundleId || '',
    stepIndex,
    ContainerType.Execution,
  );
  const serviceReferences = useContainerReferences(
    source,
    sourceId || stepBundleId || '',
    stepIndex,
    ContainerType.Service,
  );

  return (
    <ContainersTab
      executionContainers={executionContainers}
      executionReferences={executionReferences}
      serviceContainers={serviceContainers}
      serviceReferences={serviceReferences}
      onAddContainer={handleAdd}
    />
  );
};

export default StepBundleContainersTab;
