import { Box } from '@bitrise/bitkit';

import { Container, ContainerReference, ContainerType } from '@/core/models/Container';

import ContainerCard from './ContainerCard';

export type Source = 'workflows' | 'step_bundles';

type ContainersTabProps = {
  executionContainers: Container[];
  executionReferences?: ContainerReference[];
  onAddContainer: (containerId: string, type: ContainerType) => void;
  serviceContainers: Container[];
  serviceReferences?: ContainerReference[];
};

const ContainersTab = (props: ContainersTabProps) => {
  const { executionContainers, executionReferences, onAddContainer, serviceContainers, serviceReferences } = props;

  return (
    <Box display="flex" flexDir="column" gap="24">
      <ContainerCard
        type={ContainerType.Execution}
        containers={executionContainers}
        onAddContainer={(containerId) => onAddContainer(containerId, ContainerType.Execution)}
        onRecreate={() => {}}
        onRemove={() => {}}
        references={executionReferences}
      />
      <ContainerCard
        type={ContainerType.Service}
        containers={serviceContainers}
        onAddContainer={(containerId) => onAddContainer(containerId, ContainerType.Service)}
        onRecreate={() => {}}
        onRemove={() => {}}
        references={serviceReferences}
      />
    </Box>
  );
};

export default ContainersTab;
