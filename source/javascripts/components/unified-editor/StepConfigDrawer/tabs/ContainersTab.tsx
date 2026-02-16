import { Box, Notification, Text } from '@bitrise/bitkit';

import { ContainerType } from '@/core/models/Container';
import ContainerService from '@/core/services/ContainerService';
import StepService from '@/core/services/StepService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useContainers from '@/hooks/useContainers';
import useDefaultStepLibrary from '@/hooks/useDefaultStepLibrary';

import ContainerCard from '../components/ContainerCard';
import { useStepDrawerContext } from '../StepConfigDrawer.context';
import useContainerReferences from '../useContainerReferences';

const ContainersTab = () => {
  const { stepIndex, workflowId, stepBundleId, data: stepData } = useStepDrawerContext();

  const executionContainers = useContainers((containers) => {
    return ContainerService.getAllContainers(containers, (c) => c.userValues.type === ContainerType.Execution);
  });
  const serviceContainers = useContainers((containers) => {
    return ContainerService.getAllContainers(containers, (c) => c.userValues.type === ContainerType.Service);
  });

  //TODO: pass stepbundleID
  const executionReferences = useContainerReferences(workflowId, stepIndex, ContainerType.Execution);
  const serviceReferences = useContainerReferences(workflowId, stepIndex, ContainerType.Service);

  const defaultStepLibrary = useDefaultStepLibrary();
  const isStepBundle = stepData?.cvs && StepService.isStepBundle(stepData.cvs, defaultStepLibrary);
  const parentStepBundleIndex = useBitriseYmlStore((state) => {
    if (!stepBundleId || !workflowId) return -1;
    const workflow = state.yml.workflows?.[workflowId];
    if (!workflow?.steps) return -1;

    const targetCvs = `bundle::${stepBundleId}`;
    return workflow.steps.findIndex((step) => {
      const cvs = Object.keys(step)[0];
      return cvs === targetCvs;
    });
  });

  const parentBundleExecutionReferences = useContainerReferences(
    workflowId,
    parentStepBundleIndex,
    ContainerType.Execution,
  );
  const parentBundleServiceReferences = useContainerReferences(
    workflowId,
    parentStepBundleIndex,
    ContainerType.Service,
  );

  const parentHasReferences =
    !!stepBundleId &&
    parentStepBundleIndex >= 0 &&
    (!!parentBundleExecutionReferences || !!parentBundleServiceReferences);

  const childHasReferences = !!executionReferences || !!serviceReferences;

  return (
    <Box display="flex" flexDir="column" gap="24">
      {!childHasReferences && parentHasReferences ? (
        <Notification status="info">
          <Text textStyle="comp/notification/title">Containers managed by Step bundle</Text>
          <Text textStyle="comp/notification/message">
            This Step is part of a containerized Step bundle. You can change the container settings on the Step bundle.
          </Text>
        </Notification>
      ) : (
        <>
          <ContainerCard
            type={ContainerType.Execution}
            containers={executionContainers}
            references={executionReferences}
            isStepBundle={isStepBundle}
            isDisabled={childHasReferences && parentHasReferences}
          />
          <ContainerCard
            type={ContainerType.Service}
            containers={serviceContainers}
            references={serviceReferences}
            isStepBundle={isStepBundle}
            isDisabled={childHasReferences && parentHasReferences}
          />
        </>
      )}
    </Box>
  );
};

export default ContainersTab;
