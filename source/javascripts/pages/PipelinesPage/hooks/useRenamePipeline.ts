import { useCallback, useEffect, useState } from 'react';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import usePipelineSelector from './usePipelineSelector';

const useRenamePipeline = (onChange?: (newPipelineId: string) => void) => {
  const selectedPipelineId = usePipelineSelector().selectedPipeline;
  const pipelineIdsInTheStore = useBitriseYmlStore((s) => Object.keys(s.yml.pipelines ?? {}));

  const [isRenaming, setIsRenaming] = useState(false);
  const [nextPipelineId, setNextPipelineId] = useState(selectedPipelineId);
  const [prevPipelineId, setPrevPipelineId] = useState(selectedPipelineId);

  const { createPipeline, renamePipeline, deletePipeline } = useBitriseYmlStore((s) => ({
    createPipeline: s.createPipeline,
    renamePipeline: s.renamePipeline,
    deletePipeline: s.deletePipeline,
  }));

  const isNewPipelinePersisted = pipelineIdsInTheStore.includes(nextPipelineId);
  const isNewPipelineSelected = prevPipelineId !== nextPipelineId && nextPipelineId === selectedPipelineId;

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
      deletePipeline(prevPipelineId);
    }
  }, [deletePipeline, shouldFinishRenaming, prevPipelineId]);

  return useCallback(
    (newPipelineId: string) => {
      if (selectedPipelineId) {
        setIsRenaming(true);

        renamePipeline(selectedPipelineId, newPipelineId);
        createPipeline(selectedPipelineId, newPipelineId);

        setNextPipelineId(newPipelineId);
        setPrevPipelineId(selectedPipelineId);
      }
    },
    [createPipeline, renamePipeline, selectedPipelineId],
  );
};

export default useRenamePipeline;
