import ContainersTab from '@/components/unified-editor/ContainersTab/ContainersTab';
import useContainerReferences from '@/components/unified-editor/ContainersTab/hooks/useContainerReferences';
import { useStepBundleConfigContext } from '@/components/unified-editor/StepBundleConfig/StepBundleConfig.context';
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

  const { definition, instance } = useContainerReferences(source, sourceId || stepBundleId || '', stepIndex);
  console.log({ definition, instance });

  return (
    <ContainersTab
      executionContainers={executionContainers}
      executionReferences={[
        ...(definition?.[ContainerType.Execution] || []),
        ...(instance?.[ContainerType.Execution] || []),
      ]}
      serviceContainers={serviceContainers}
      serviceReferences={[...(definition?.[ContainerType.Service] || []), ...(instance?.[ContainerType.Service] || [])]}
      onAddContainer={handleAdd}
    />
  );
};

export default StepBundleContainersTab;
