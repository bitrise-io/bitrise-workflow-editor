import { Box } from '@bitrise/bitkit';

import { Container, ContainerType } from '@/core/models/Container';

import ContainerCard from './ContainerCard';
import { UseContainerReferencesReturnValue } from './hooks/useContainerReferences';

export type Source = 'workflows' | 'step_bundles';

type ContainersTabProps = {
  executionContainers: Container[];
  isDefinitionReferencesDisabled?: boolean;
  onAddContainer: (containerId: string, type: ContainerType) => void;
  onRecreate: (containerId: string, recreate: boolean, type: ContainerType) => void;
  onRemove: (containerId: string, type: ContainerType) => void;
  references?: UseContainerReferencesReturnValue;
  serviceContainers: Container[];
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
  } = props;

  return (
    <Box display="flex" flexDir="column" gap="24">
      <ContainerCard
        type={ContainerType.Execution}
        containers={executionContainers}
        onAddContainer={onAddContainer}
        onRecreate={onRecreate}
        onRemove={onRemove}
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
        definitionReferences={references?.definition?.[ContainerType.Service]}
        instanceReferences={references?.instance?.[ContainerType.Service]}
        isDefinitionReferencesDisabled={isDefinitionReferencesDisabled}
      />
    </Box>
  );
};

export default ContainersTab;
