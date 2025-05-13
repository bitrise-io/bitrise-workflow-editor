import { useCallback, useEffect, useState } from 'react';

import PipelineService from '@/core/services/PipelineService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

import usePipelineSelector from './usePipelineSelector';

const useRenamePipeline = (onChange?: (newPipelineId: string) => void) => {
  const selectedPipelineId = usePipelineSelector().selectedPipeline;
  const pipelineIdsInTheStore = useBitriseYmlStore((s) => Object.keys(s.yml.pipelines ?? {}));

  const [isRenaming, setIsRenaming] = useState(false);
  const [nextPipelineId, setNextPipelineId] = useState(selectedPipelineId);
  const [prevPipelineId, setPrevPipelineId] = useState(selectedPipelineId);

  const isNewPipelinePersisted = pipelineIdsInTheStore.includes(nextPipelineId);
  const isNewPipelineSelected = nextPipelineId === selectedPipelineId;

  const shouldRunOnChange = isRenaming && isNewPipelinePersisted && !isNewPipelineSelected;
  const shouldFinishRenaming = isRenaming && isNewPipelinePersisted && isNewPipelineSelected;

  useEffect(() => {
    if (shouldRunOnChange) {
      onChange?.(nextPipelineId);
    }
  }, [onChange, shouldRunOnChange, nextPipelineId]);

  useEffect(() => {
    if (shouldFinishRenaming) {
      setIsRenaming(false);
      PipelineService.deletePipeline(prevPipelineId);
    }
  }, [shouldFinishRenaming, prevPipelineId]);

  return useCallback(
    (newPipelineId: string) => {
      if (selectedPipelineId) {
        setIsRenaming(true);

        PipelineService.renamePipeline(selectedPipelineId, newPipelineId);
        PipelineService.createPipeline(selectedPipelineId, newPipelineId);

        setNextPipelineId(newPipelineId);
        setPrevPipelineId(selectedPipelineId);
      }
    },
    [selectedPipelineId],
  );
};

export default useRenamePipeline;
