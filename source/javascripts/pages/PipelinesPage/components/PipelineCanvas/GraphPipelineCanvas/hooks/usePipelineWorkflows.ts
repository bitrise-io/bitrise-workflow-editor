import PipelineService from '@/core/services/PipelineService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

import usePipelineSelector from '../../../../hooks/usePipelineSelector';
import { PipelineCanvasWorkflow } from '../GraphPipelineCanvas.types';

const usePipelineWorkflows = (): PipelineCanvasWorkflow[] => {
  const { selectedPipeline } = usePipelineSelector();

  return useBitriseYmlStore(({ yml }) => {
    const pipelineWorkflows = yml.pipelines?.[selectedPipeline]?.workflows ?? {};

    return Object.entries(pipelineWorkflows).map(([id, pipelineWorkflow]) => {
      return {
        id,
        uses: pipelineWorkflow?.uses,
        parallel: pipelineWorkflow?.parallel,
        dependsOn: pipelineWorkflow?.depends_on ?? [],
        isGenerator: PipelineService.isGeneratorWorkflow(pipelineWorkflow?.uses || id, yml),
      } satisfies PipelineCanvasWorkflow;
    });
  });
};

export default usePipelineWorkflows;
