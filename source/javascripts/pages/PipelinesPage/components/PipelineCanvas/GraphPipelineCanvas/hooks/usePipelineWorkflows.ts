import { PipelineWorkflow } from '@/core/models/Workflow';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

import usePipelineSelector from '../../../../hooks/usePipelineSelector';

const usePipelineWorkflows = (): PipelineWorkflow[] => {
  const { selectedPipeline } = usePipelineSelector();

  return useBitriseYmlStore(({ yml }) => {
    const pipelineWorkflows = yml.pipelines?.[selectedPipeline]?.workflows ?? {};

    return Object.entries(pipelineWorkflows).map(([id, pipelineWorkflow]) => {
      return {
        id,
        uses: pipelineWorkflow.uses,
        parallel: pipelineWorkflow.parallel,
        dependsOn: pipelineWorkflow.depends_on ?? [],
      } satisfies PipelineWorkflow;
    });
  });
};

export default usePipelineWorkflows;
