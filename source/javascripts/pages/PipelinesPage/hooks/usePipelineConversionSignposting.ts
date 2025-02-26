import { useCallback, useMemo } from 'react';
import { useSessionStorage } from 'usehooks-ts';
import WindowUtils from '@/core/utils/WindowUtils';

const usePipelineConversionSignposting = () => {
  const key = ['pipeline-conversion-signposting', WindowUtils.appSlug() ?? 'cli'].join('-');
  const [state, setState] = useSessionStorage<string[]>(key, []);

  const isPipelineConversionSignpostingHiddenFor = useCallback(
    (pipelineId: string) => state.includes(pipelineId),
    [state],
  );

  const hidePipelineConversionSignpostingFor = useCallback(
    (pipelineId: string) => setState((prev) => (prev.includes(pipelineId) ? prev : [...prev, pipelineId])),
    [setState],
  );

  return useMemo(
    () => ({
      isPipelineConversionSignpostingHiddenFor,
      hidePipelineConversionSignpostingFor,
    }),
    [isPipelineConversionSignpostingHiddenFor, hidePipelineConversionSignpostingFor],
  );
};

export default usePipelineConversionSignposting;
