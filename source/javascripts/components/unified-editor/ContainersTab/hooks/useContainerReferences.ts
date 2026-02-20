import { ContainerReference, ContainerType } from '@/core/models/Container';
import ContainerService from '@/core/services/ContainerService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

export type UseContainerReferencesReturnValue = {
  definition?: Record<ContainerType, ContainerReference[] | undefined>;
  instance?: Record<ContainerType, ContainerReference[] | undefined>;
};

function useContainerReferences(
  source: 'workflows' | 'step_bundles',
  sourceId: string,
  stepIndex: number,
  stepBundleId?: string,
): UseContainerReferencesReturnValue {
  const ymlDocument = useBitriseYmlStore((state) => state.ymlDocument);

  const returnValue: UseContainerReferencesReturnValue = {};

  if (stepBundleId) {
    returnValue.definition = {
      [ContainerType.Execution]: ContainerService.getContainerReferencesFromStepBundleDefinition(
        stepBundleId,
        ContainerType.Execution,
        ymlDocument,
      ),
      [ContainerType.Service]: ContainerService.getContainerReferencesFromStepBundleDefinition(
        stepBundleId,
        ContainerType.Service,
        ymlDocument,
      ),
    };
  }

  if (stepIndex > -1) {
    returnValue.instance = {
      [ContainerType.Execution]: ContainerService.getContainerReferenceFromInstance(
        source,
        sourceId,
        stepIndex,
        ContainerType.Execution,
        ymlDocument,
      ),
      [ContainerType.Service]: ContainerService.getContainerReferenceFromInstance(
        source,
        sourceId,
        stepIndex,
        ContainerType.Service,
        ymlDocument,
      ),
    };
  }

  return returnValue;
}

export default useContainerReferences;
