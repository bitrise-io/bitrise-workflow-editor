import { useCallback, useEffect, useState } from 'react';
import { useDebounceCallback } from 'usehooks-ts';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import usePipelineSelector from './usePipelineSelector';

const useRenamePipeline = (onChange?: (newPipelineId: string) => void) => {
  const { selectedPipeline: currentPipelineId } = usePipelineSelector();

  const [isRenaming, setIsRenaming] = useState(false);
  const [previousPipelineId, setPreviousPipelineId] = useState(currentPipelineId);

  const { createPipeline, renamePipeline, deletePipeline } = useBitriseYmlStore((s) => ({
    createPipeline: s.createPipeline,
    renamePipeline: s.renamePipeline,
    deletePipeline: s.deletePipeline,
  }));

  const renameCallback = useCallback(
    (newPipelineId: string) => {
      setIsRenaming(true);
      renamePipeline(currentPipelineId, newPipelineId);
      createPipeline(currentPipelineId, newPipelineId);
      setPreviousPipelineId(currentPipelineId);

      onChange?.(newPipelineId);
    },
    [onChange, createPipeline, renamePipeline, currentPipelineId],
  );

  useEffect(() => {
    if (isRenaming && previousPipelineId && currentPipelineId && previousPipelineId !== currentPipelineId) {
      setIsRenaming(false);
      deletePipeline(previousPipelineId);
      setPreviousPipelineId(currentPipelineId);
    }
  }, [isRenaming, currentPipelineId, previousPipelineId, deletePipeline]);

  return useDebounceCallback(renameCallback, 250);
};

export default useRenamePipeline;
