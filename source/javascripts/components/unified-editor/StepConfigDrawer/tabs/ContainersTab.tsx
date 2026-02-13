import { Box } from '@bitrise/bitkit';

import { ContainerType } from '@/core/models/Container';
import ContainerService from '@/core/services/ContainerService';
import StepService from '@/core/services/StepService';
import useContainers from '@/hooks/useContainers';
import useDefaultStepLibrary from '@/hooks/useDefaultStepLibrary';

import ContainerCard from '../components/ContainerCard';
import { useStepDrawerContext } from '../StepConfigDrawer.context';
import useContainerReferences from '../useContainerReferences';

const ContainersTab = () => {
  const { stepIndex, workflowId, data: stepData } = useStepDrawerContext();

  const executionContainers = useContainers((containers) => {
    return ContainerService.getAllContainers(containers, (c) => c.userValues.type === ContainerType.Execution);
  });
  const serviceContainers = useContainers((containers) => {
    return ContainerService.getAllContainers(containers, (c) => c.userValues.type === ContainerType.Service);
  });

  const executionReferences = useContainerReferences(workflowId, stepIndex, ContainerType.Execution);
  const serviceReferences = useContainerReferences(workflowId, stepIndex, ContainerType.Service);

  const defaultStepLibrary = useDefaultStepLibrary();
  const isStepBundle = stepData?.cvs && StepService.isStepBundle(stepData.cvs, defaultStepLibrary);

  return (
    <Box display="flex" flexDir="column" gap="24">
      <ContainerCard
        type={ContainerType.Execution}
        containers={executionContainers}
        references={executionReferences}
        isStepBundle={isStepBundle}
      />
      <ContainerCard
        type={ContainerType.Service}
        containers={serviceContainers}
        references={serviceReferences}
        isStepBundle={isStepBundle}
      />
    </Box>
  );
};

export default ContainersTab;
