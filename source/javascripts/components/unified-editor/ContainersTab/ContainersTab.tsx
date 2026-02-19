import { Box } from '@bitrise/bitkit';

import { ContainerType } from '@/core/models/Container';
import ContainerService from '@/core/services/ContainerService';
import useContainers from '@/hooks/useContainers';

import ContainerCard from './ContainerCard';

export type Source = 'workflows' | 'step_bundles';

type ContainersTabProps = {
  onAddContainer: (containerId: string, type: ContainerType) => void;
};

const ContainersTab = (props: ContainersTabProps) => {
  const { onAddContainer } = props;

  const executionContainers = useContainers((containers) => {
    return ContainerService.getAllContainers(containers, (c) => c.userValues.type === ContainerType.Execution);
  });
  const serviceContainers = useContainers((containers) => {
    return ContainerService.getAllContainers(containers, (c) => c.userValues.type === ContainerType.Service);
  });

  return (
    <Box display="flex" flexDir="column" gap="24">
      <ContainerCard
        type={ContainerType.Execution}
        containers={executionContainers}
        onAddContainer={(containerId) => onAddContainer(containerId, ContainerType.Execution)}
        onRecreate={() => {}}
        onRemove={() => {}}
        references={[]}
      />
      <ContainerCard
        type={ContainerType.Service}
        containers={serviceContainers}
        onAddContainer={(containerId) => onAddContainer(containerId, ContainerType.Service)}
        onRecreate={() => {}}
        onRemove={() => {}}
        references={[]}
      />
    </Box>
  );
};

export default ContainersTab;
