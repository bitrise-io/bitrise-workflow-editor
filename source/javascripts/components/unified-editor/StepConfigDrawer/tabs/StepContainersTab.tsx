import ContainersTab from '@/components/unified-editor/ContainersTab/ContainersTab';
import { useStepDrawerContext } from '@/components/unified-editor/StepConfigDrawer/StepConfigDrawer.context';
import ContainerService from '@/core/services/ContainerService';

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

  return <ContainersTab onAddContainer={handleAdd} />;
};

export default StepContainersTab;
