import { ContainerReference, ContainerType } from '@/core/models/Container';
import ContainerService from '@/core/services/ContainerService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

type ReturnValue = {
  definition: Record<ContainerType, ContainerReference[] | undefined>;
  instance?: Record<ContainerType, ContainerReference[] | undefined>;
};

function useContainerReferences(
  source: 'workflows' | 'step_bundles',
  sourceId: string,
  stepIndex: number,
): ReturnValue {
  const ymlDocument = useBitriseYmlStore((state) => state.ymlDocument);

  const returnValue: ReturnValue = {
    definition: {
      [ContainerType.Execution]: ContainerService.getContainerReferencesFromStepBundleDefinition(
        sourceId,
        ContainerType.Execution,
        ymlDocument,
      ),
      [ContainerType.Service]: ContainerService.getContainerReferencesFromStepBundleDefinition(
        sourceId,
        ContainerType.Service,
        ymlDocument,
      ),
    },
  };

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
