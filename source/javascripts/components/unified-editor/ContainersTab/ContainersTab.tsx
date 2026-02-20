import { Box } from '@bitrise/bitkit';

import { Container, ContainerReference, ContainerType } from '@/core/models/Container';

import ContainerCard from './ContainerCard';

export type Source = 'workflows' | 'step_bundles';

type ContainersTabProps = {
  executionContainers: Container[];
  executionReferences?: ContainerReference[];
  onAddContainer: (containerId: string, type: ContainerType) => void;
  onRecreate: (containerId: string, recreate: boolean, type: ContainerType) => void;
  onRemove: (containerId: string, type: ContainerType) => void;
  serviceContainers: Container[];
  serviceReferences?: ContainerReference[];
};

const ContainersTab = (props: ContainersTabProps) => {
  const {
    executionContainers,
    executionReferences,
    onAddContainer,
    onRecreate,
    onRemove,
    serviceContainers,
    serviceReferences,
  } = props;

  return (
    <Box display="flex" flexDir="column" gap="24">
      <ContainerCard
        type={ContainerType.Execution}
        containers={executionContainers}
        onAddContainer={onAddContainer}
        onRecreate={onRecreate}
        onRemove={onRemove}
        references={executionReferences}
      />
      <ContainerCard
        type={ContainerType.Service}
        containers={serviceContainers}
        onAddContainer={onAddContainer}
        onRecreate={onRecreate}
        onRemove={onRemove}
        references={serviceReferences}
      />
    </Box>
  );
};

export default ContainersTab;
