import { useCallback, useMemo } from 'react';
import { useSessionStorage } from 'usehooks-ts';
import WindowUtils from '@/core/utils/WindowUtils';
import { useBitriseYmlStoreApi } from '@/hooks/useBitriseYmlStore';
import PipelineService from '@/core/services/PipelineService';

const usePipelineConversionSignposting = () => {
  const key = ['pipeline-conversion-signposting', WindowUtils.appSlug() ?? 'cli'].join('-');
  const [state, setState] = useSessionStorage<string[]>(key, []);
  const bitriseYmlStoreApi = useBitriseYmlStoreApi();

  const isPipelineConversionSignpostingHiddenFor = useCallback(
    (pipelineId: string) => {
      const isGraph = PipelineService.isGraph(bitriseYmlStoreApi.getState().yml.pipelines?.[pipelineId] ?? {});
      return isGraph || state.includes(pipelineId);
    },
    [state, bitriseYmlStoreApi],
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
