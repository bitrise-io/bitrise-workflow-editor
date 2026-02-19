import ContainersTab from '@/components/unified-editor/ContainersTab/ContainersTab';
import { useStepDrawerContext } from '@/components/unified-editor/StepConfigDrawer/StepConfigDrawer.context';
import useContainerReferences from '@/components/unified-editor/StepConfigDrawer/useContainerReferences';
import { ContainerType } from '@/core/models/Container';
import ContainerService from '@/core/services/ContainerService';
import useContainers from '@/hooks/useContainers';

const StepContainersTab = () => {
  const { workflowId, stepBundleId, stepIndex } = useStepDrawerContext();

  const handleAdd = (containerId: string) => {
    ContainerService.addContainerReference(
      stepBundleId ? 'step_bundles' : 'workflows',
      stepBundleId || workflowId,
      stepIndex,
      containerId,
    );
  };

  const source = stepBundleId ? 'step_bundles' : 'workflows';
  const sourceId = stepBundleId || workflowId;

  const executionContainers = useContainers((containers) => {
    return ContainerService.getAllContainers(containers, (c) => c.userValues.type === ContainerType.Execution);
  });
  const serviceContainers = useContainers((containers) => {
    return ContainerService.getAllContainers(containers, (c) => c.userValues.type === ContainerType.Service);
  });

  const executionReferences = useContainerReferences(source, sourceId, stepIndex, ContainerType.Execution);
  const serviceReferences = useContainerReferences(source, sourceId, stepIndex, ContainerType.Service);

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

export default StepContainersTab;
