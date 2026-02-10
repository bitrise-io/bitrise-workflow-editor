import { Box } from '@bitrise/bitkit';

import { ContainerType } from '@/core/models/Container';
import ContainerService from '@/core/services/ContainerService';
import useContainers from '@/hooks/useContainers';

import ContainerCard from '../components/ContainerCard';
import { useStepDrawerContext } from '../StepConfigDrawer.context';
import useContainerReferences from '../useContainerReferences';

const ContainersTab = () => {
  const { stepIndex, workflowId } = useStepDrawerContext();

  const executionContainers = useContainers((containers) => {
    return ContainerService.getAllContainers(containers, (c) => c.userValues.type === ContainerType.Execution);
  });
  const serviceContainers = useContainers((containers) => {
    return ContainerService.getAllContainers(containers, (c) => c.userValues.type === ContainerType.Service);
  });

  const executionReferences = useContainerReferences(workflowId, stepIndex, ContainerType.Execution);
  const serviceReferences = useContainerReferences(workflowId, stepIndex, ContainerType.Service);

  return (
    <Box display="flex" flexDir="column" gap="24">
      <ContainerCard type={ContainerType.Execution} containers={executionContainers} references={executionReferences} />
      <ContainerCard type={ContainerType.Service} containers={serviceContainers} references={serviceReferences} />
    </Box>
  );
};

export default ContainersTab;
