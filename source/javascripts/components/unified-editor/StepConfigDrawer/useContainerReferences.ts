import { ContainerType } from '@/core/models/Container';
import ContainerService from '@/core/services/ContainerService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

function useContainerReferences(workflowId: string, stepIndex: number, type: ContainerType): string[] | undefined {
  const ymlDocument = useBitriseYmlStore((state) => state.ymlDocument);
  return ContainerService.getContainerReferences(workflowId, stepIndex, type, ymlDocument);
}

export default useContainerReferences;
