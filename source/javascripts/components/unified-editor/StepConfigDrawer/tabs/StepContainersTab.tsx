import ContainersTab from '@/components/unified-editor/ContainersTab/ContainersTab';
import useContainerReferences from '@/components/unified-editor/ContainersTab/hooks/useContainerReferences';
import { useStepDrawerContext } from '@/components/unified-editor/StepConfigDrawer/StepConfigDrawer.context';
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

  const handleRecreate = (containerId: string, recreate: boolean) => {
    ContainerService.updateContainerReferenceRecreate(
      stepBundleId ? 'step_bundles' : 'workflows',
      stepBundleId || workflowId,
      stepIndex,
      containerId,
      recreate,
    );
  };

  const handleRemove = (containerId: string) => {
    ContainerService.removeContainerReference(
      stepBundleId ? 'step_bundles' : 'workflows',
      stepBundleId || workflowId,
      stepIndex,
      containerId,
    );
  };

  const source = stepBundleId ? 'step_bundles' : 'workflows';
  const sourceId = stepBundleId || workflowId;

  const { [ContainerType.Execution]: executionContainers, [ContainerType.Service]: serviceContainers } =
    useContainers();

  const { instance } = useContainerReferences(source, sourceId || '', stepIndex);

  return (
    <ContainersTab
      executionContainers={executionContainers}
      serviceContainers={serviceContainers}
      references={{ instance }}
      onAddContainer={handleAdd}
      onRecreate={handleRecreate}
      onRemove={handleRemove}
    />
  );
};

export default StepContainersTab;
