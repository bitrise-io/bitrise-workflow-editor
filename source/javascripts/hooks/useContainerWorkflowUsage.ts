import ContainerService from '@/core/services/ContainerService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

function useContainerWorkflowUsage(): Map<string, string[]>;
function useContainerWorkflowUsage(id: string): string[];

function useContainerWorkflowUsage(id?: string) {
  return useBitriseYmlStore((state) => {
    if (id) {
      return ContainerService.getWorkflowsUsingContainer(state.ymlDocument, id);
    }

    const containerIds = Object.keys(state.yml.containers ?? {});

    return containerIds.reduce((acc, id) => {
      const workflowsUsingContainer = ContainerService.getWorkflowsUsingContainer(state.ymlDocument, id);
      acc.set(id, workflowsUsingContainer);
      return acc;
    }, new Map<string, string[]>());
  });
}

export default useContainerWorkflowUsage;
