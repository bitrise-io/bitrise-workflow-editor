import { Box } from '@bitrise/bitkit';

import { Container, ContainerType } from '@/core/models/Container';

import ContainerCard from './ContainerCard';
import { type ContainerReferenceSource } from './ContainersMenu';
import { UseContainerReferencesReturnValue } from './hooks/useContainerReferences';

export type Source = 'workflows' | 'step_bundles';

type ContainersTabProps = {
  executionContainers: Container[];
  isDefinitionReferencesDisabled?: boolean;
  onAddContainer: (containerId: string) => void;
  onRecreate: (containerId: string, recreate: boolean) => void;
  onRemove: (containerId: string) => void;
  references?: UseContainerReferencesReturnValue;
  serviceContainers: Container[];
  source: ContainerReferenceSource;
  stepBundleId?: string;
  stepId?: string;
};

const ContainersTab = (props: ContainersTabProps) => {
  const {
    executionContainers,
    isDefinitionReferencesDisabled,
    onAddContainer,
    onRecreate,
    onRemove,
    references,
    serviceContainers,
    source,
    stepBundleId,
    stepId,
  } = props;

  return (
    <Box display="flex" flexDir="column" gap="24">
      <ContainerCard
        type={ContainerType.Execution}
        containers={executionContainers}
        onAddContainer={onAddContainer}
        onRecreate={onRecreate}
        onRemove={onRemove}
        source={source}
        stepBundleId={stepBundleId}
        stepId={stepId}
        definitionReferences={references?.definition?.[ContainerType.Execution]}
        instanceReferences={references?.instance?.[ContainerType.Execution]}
        isDefinitionReferencesDisabled={isDefinitionReferencesDisabled}
      />
      <ContainerCard
        type={ContainerType.Service}
        containers={serviceContainers}
        onAddContainer={onAddContainer}
        onRecreate={onRecreate}
        onRemove={onRemove}
        source={source}
        stepBundleId={stepBundleId}
        stepId={stepId}
        definitionReferences={references?.definition?.[ContainerType.Service]}
        instanceReferences={references?.instance?.[ContainerType.Service]}
        isDefinitionReferencesDisabled={isDefinitionReferencesDisabled}
      />
    </Box>
  );
};

export default ContainersTab;
