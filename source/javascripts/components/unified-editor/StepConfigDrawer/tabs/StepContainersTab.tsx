import ContainersTab from '@/components/unified-editor/ContainersTab/ContainersTab';
import useContainerReferences from '@/components/unified-editor/ContainersTab/hooks/useContainerReferences';
import { useStepDrawerContext } from '@/components/unified-editor/StepConfigDrawer/StepConfigDrawer.context';
import { ContainerType } from '@/core/models/Container';
import ContainerService from '@/core/services/ContainerService';
import useContainers from '@/hooks/useContainers';

const StepContainersTab = () => {
  const { workflowId, stepBundleId, stepIndex } = useStepDrawerContext();

  const handleAdd = (containerId: string, type: ContainerType) => {
    ContainerService.addContainerReference(
      stepBundleId ? 'step_bundles' : 'workflows',
      stepBundleId || workflowId,
      stepIndex,
      containerId,
      type,
    );
  };

  const handleRecreate = (containerId: string, recreate: boolean, type: ContainerType) => {
    ContainerService.updateContainerReferenceRecreate(
      stepBundleId ? 'step_bundles' : 'workflows',
      stepBundleId || workflowId,
      stepIndex,
      containerId,
      type,
      recreate,
    );
  };

  const handleRemove = (containerId: string, type: ContainerType) => {
    ContainerService.removeContainerReference(
      stepBundleId ? 'step_bundles' : 'workflows',
      stepBundleId || workflowId,
      stepIndex,
      containerId,
      type,
    );
  };

  const source = stepBundleId ? 'step_bundles' : 'workflows';
  const sourceId = stepBundleId || workflowId;

  const {
    [ContainerType.Execution]: executionContainers,
    [ContainerType.Service]: serviceContainers,
    withoutType: otherContainers,
  } = useContainers();

  const { instance } = useContainerReferences(source, sourceId || '', stepIndex);

  return (
    <ContainersTab
      executionContainers={[...executionContainers, ...otherContainers]}
      serviceContainers={[...serviceContainers, ...otherContainers]}
      references={{ instance }}
      onAddContainer={handleAdd}
      onRecreate={handleRecreate}
      onRemove={handleRemove}
    />
  );
};

export default StepContainersTab;
