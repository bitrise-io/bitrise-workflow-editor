import ContainerService from '@/core/services/ContainerService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

const useContainerWorkflowUsage = () => {
  return useBitriseYmlStore((state) => {
    const containerIds = Object.keys(state.yml.containers ?? {});

    return containerIds.reduce((acc, id) => {
      const workflowsUsingContainer = ContainerService.getWorkflowsUsingContainer(state.ymlDocument, id);
      acc.set(id, workflowsUsingContainer);
      return acc;
    }, new Map<string, string[]>());
  });
};

export default useContainerWorkflowUsage;
