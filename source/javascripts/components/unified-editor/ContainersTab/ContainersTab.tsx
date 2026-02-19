import { Box } from '@bitrise/bitkit';

import { ContainerType } from '@/core/models/Container';
import ContainerService from '@/core/services/ContainerService';
import useContainers from '@/hooks/useContainers';

import ContainerCard from './ContainerCard';

export type Source = 'workflows' | 'step_bundles';

type ContainersTabProps = {
  onAddContainer: (containerId: string, type: ContainerType) => void;
  source: Source;
  sourceId: string;
  stepIndex: number;
  variant: 'panel' | 'drawer';
};

const ContainersTab = (props: ContainersTabProps) => {
  const { onAddContainer, source, sourceId, stepIndex, variant } = props;
  console.log(source, sourceId, stepIndex, variant);

  const executionContainers = useContainers((containers) => {
    return ContainerService.getAllContainers(containers, (c) => c.userValues.type === ContainerType.Execution);
  });
  const serviceContainers = useContainers((containers) => {
    return ContainerService.getAllContainers(containers, (c) => c.userValues.type === ContainerType.Service);
  });

  //TODO: pass stepbundleID
  // const executionReferences = useContainerReferences(source, sourceId, stepIndex, ContainerType.Execution);
  // const serviceReferences = useContainerReferences(source, sourceId, stepIndex, ContainerType.Service);

  // const defaultStepLibrary = useDefaultStepLibrary();
  // const isStepBundle = stepData?.cvs && StepService.isStepBundle(stepData.cvs, defaultStepLibrary);
  // const parentStepBundleIndex = useBitriseYmlStore((state) => {
  //   if (!stepBundleId || !sourceId) return -1;
  //   const workflow = state.yml.workflows?.[sourceId];
  //   if (!workflow?.steps) return -1;

  //   const targetCvs = `bundle::${stepBundleId}`;
  //   return workflow.steps.findIndex((step) => {
  //     const cvs = Object.keys(step)[0];
  //     return cvs === targetCvs;
  //   });
  // });

  // const parentBundleExecutionReferences = useContainerReferences(
  //   sourceId,
  //   parentStepBundleIndex,
  //   ContainerType.Execution,
  // );
  // const parentBundleServiceReferences = useContainerReferences(sourceId, parentStepBundleIndex, ContainerType.Service);

  // const parentHasReferences =
  //   !!stepBundleId &&
  //   parentStepBundleIndex >= 0 &&
  //   (!!parentBundleExecutionReferences || !!parentBundleServiceReferences);

  // const childHasReferences = !!executionReferences || !!serviceReferences;

  return (
    <Box display="flex" flexDir="column" gap="24">
      <ContainerCard
        type={ContainerType.Execution}
        containers={executionContainers}
        onAddContainer={(containerId) => onAddContainer(containerId, ContainerType.Execution)}
        onRecreate={console.log}
        onRemove={console.log}
        references={[]}
      />
      <ContainerCard
        type={ContainerType.Service}
        containers={serviceContainers}
        onAddContainer={(containerId) => onAddContainer(containerId, ContainerType.Service)}
        onRecreate={console.log}
        onRemove={console.log}
        references={[]}
      />
    </Box>
  );
};

export default ContainersTab;
