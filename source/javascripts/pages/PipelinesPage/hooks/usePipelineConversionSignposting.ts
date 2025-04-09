import { useCallback, useMemo } from 'react';
import { useSessionStorage } from 'usehooks-ts';

import PipelineService from '@/core/services/PipelineService';
import PageProps from '@/core/utils/PageProps';
import { bitriseYmlStore } from '@/core/stores/BitriseYmlStore';

const usePipelineConversionSignposting = () => {
  const key = ['pipeline-conversion-signposting', PageProps.appSlug() || 'cli'].join('-');
  const [state, setState] = useSessionStorage<string[]>(key, []);

  const isPipelineConversionSignpostingHiddenFor = useCallback(
    (pipelineId: string) => {
      const isGraph = PipelineService.isGraph(bitriseYmlStore.getState().yml.pipelines?.[pipelineId] ?? {});
      return isGraph || state.includes(pipelineId);
    },
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
