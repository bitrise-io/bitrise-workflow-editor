import { ContainerReference, ContainerType } from '@/core/models/Container';
import ContainerService from '@/core/services/ContainerService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

function useContainerReferences(
  source: 'workflows' | 'step_bundles',
  sourceId: string,
  stepIndex: number,
  type: ContainerType,
): ContainerReference[] | undefined {
  const ymlDocument = useBitriseYmlStore((state) => state.ymlDocument);

  return ContainerService.getContainerReferences(source, sourceId, stepIndex, type, ymlDocument);
}

export default useContainerReferences;
