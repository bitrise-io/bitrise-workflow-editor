import { useCallback, useEffect, useRef } from 'react';
import { uniq } from 'es-toolkit';
import { useDebounceCallback } from 'usehooks-ts';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import usePipelineSelector from './usePipelineSelector';

const useRenamePipeline = (onChange?: (newPipelineId: string) => void) => {
  const { selectedPipeline } = usePipelineSelector();
  const oldPipelineIdRef = useRef(selectedPipeline);
  const newPipelineIdRef = useRef(selectedPipeline);
  const removablePipelineIdsRef = useRef<string[]>([]);

  const { pipelines, createPipeline, renamePipeline, deletePipelines } = useBitriseYmlStore((s) => ({
    pipelines: s.yml.pipelines ?? {},
    createPipeline: s.createPipeline,
    renamePipeline: s.renamePipeline,
    deletePipelines: s.deletePipelines,
  }));

  useEffect(() => {
    newPipelineIdRef.current = selectedPipeline;
  }, [selectedPipeline]);

  useEffect(() => {
    const isChanged = oldPipelineIdRef.current !== newPipelineIdRef.current;
    const isNewPipelineExists = Object.keys(pipelines).includes(newPipelineIdRef.current);
    const isNewPipelineSelected = selectedPipeline === newPipelineIdRef.current;

    if (!isChanged || !isNewPipelineExists) {
      return;
    }

    if (!isNewPipelineSelected) {
      onChange?.(newPipelineIdRef.current);
    }

    if (isNewPipelineSelected) {
      oldPipelineIdRef.current = newPipelineIdRef.current;
      deletePipelines(removablePipelineIdsRef.current);
      removablePipelineIdsRef.current = [];
    }
  }, [selectedPipeline, pipelines, deletePipelines, onChange]);

  const renameCallback = useCallback(
    (newPipelineId: string) => {
      removablePipelineIdsRef.current =
        newPipelineIdRef.current === newPipelineId
          ? removablePipelineIdsRef.current
          : uniq([...removablePipelineIdsRef.current, newPipelineIdRef.current]);

      renamePipeline(newPipelineIdRef.current, newPipelineId);
      createPipeline(newPipelineIdRef.current, newPipelineId);

      newPipelineIdRef.current = newPipelineId;
    },
    [createPipeline, renamePipeline],
  );

  return useDebounceCallback(renameCallback, 250);
};

export default useRenamePipeline;
