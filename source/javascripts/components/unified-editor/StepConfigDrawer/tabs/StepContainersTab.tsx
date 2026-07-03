import ContainersTab from '@/components/unified-editor/ContainersTab/ContainersTab';
import useContainerReferences from '@/components/unified-editor/ContainersTab/hooks/useContainerReferences';
import { useStepDrawerContext } from '@/components/unified-editor/StepConfigDrawer/StepConfigDrawer.context';
import { ContainerType } from '@/core/models/Container';
import ContainerService from '@/core/services/ContainerService';
import useContainers from '@/hooks/useContainers';

const StepContainersTab = () => {
  const { workflowId, stepBundleId, stepIndex, data } = useStepDrawerContext();

  const { [ContainerType.Execution]: executionContainers, [ContainerType.Service]: serviceContainers } =
    useContainers();

  const handleAdd = (containerId: string) => {
    // The container may be defined in another module, so resolve it from the aggregated list and use
    // its actual type; no-op if it can't be found rather than writing a wrong/dangling reference.
    const container = [...executionContainers, ...serviceContainers].find((c) => c.id === containerId);
    if (!container) {
      return;
    }
    ContainerService.addContainerReference(
      stepBundleId ? 'step_bundles' : 'workflows',
      stepBundleId || workflowId,
      stepIndex,
      containerId,
      container.userValues.type as ContainerType,
    );
  };

  const handleRecreate = (containerId: string, recreate: boolean) => {
    // The container may be defined in another module, so resolve it from the aggregated list for its type.
    const container = [...executionContainers, ...serviceContainers].find((c) => c.id === containerId);
    if (!container) {
      return;
    }
    ContainerService.updateContainerReferenceRecreate(
      stepBundleId ? 'step_bundles' : 'workflows',
      stepBundleId || workflowId,
      stepIndex,
      containerId,
      recreate,
      container.userValues.type as ContainerType,
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

  const { instance } = useContainerReferences({
    source,
    sourceId: sourceId || '',
    stepIndex,
    isEnabled: stepIndex > -1,
    stepBundleId,
  });

  return (
    <ContainersTab
      executionContainers={executionContainers}
      serviceContainers={serviceContainers}
      references={{ instance }}
      source="step_instance"
      stepBundleId={stepBundleId}
      stepId={data?.id}
      stepVersion={data?.resolvedInfo?.resolvedVersion}
      onAddContainer={handleAdd}
      onRecreate={handleRecreate}
      onRemove={handleRemove}
    />
  );
};

export default StepContainersTab;
