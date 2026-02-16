import { ContainerReference, ContainerType } from '@/core/models/Container';
import ContainerService from '@/core/services/ContainerService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

function useContainerReferences(
  workflowId: string,
  stepIndex: number,
  type: ContainerType,
): ContainerReference[] | undefined {
  const ymlDocument = useBitriseYmlStore((state) => state.ymlDocument);

  if (!workflowId || stepIndex < 0) {
    return undefined;
  }

  return ContainerService.getContainerReferences(workflowId, stepIndex, type, ymlDocument);
}

export default useContainerReferences;
