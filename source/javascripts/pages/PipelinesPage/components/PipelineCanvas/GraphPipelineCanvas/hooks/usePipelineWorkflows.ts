import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { PipelineWorkflow } from '@/core/models/Workflow';

import usePipelineSelector from '../../../../hooks/usePipelineSelector';

const usePipelineWorkflows = (): PipelineWorkflow[] => {
  const { selectedPipeline } = usePipelineSelector();

  return useBitriseYmlStore(({ yml }) => {
    const pipelineWorkflows = yml.pipelines?.[selectedPipeline]?.workflows ?? {};

    return Object.entries(pipelineWorkflows).map(([id, pipelineWorkflow]) => {
      return {
        id,
        basedOn: pipelineWorkflow.based_on,
        dependsOn: pipelineWorkflow.depends_on ?? [],
      } satisfies PipelineWorkflow;
    });
  });
};

export default usePipelineWorkflows;
