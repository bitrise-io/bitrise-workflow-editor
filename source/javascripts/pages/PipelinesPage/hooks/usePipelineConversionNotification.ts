import { useCallback, useMemo } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import WindowUtils from '@/core/utils/WindowUtils';

const usePipelineConversionNotification = () => {
  const key = ['pipeline-conversion-notification', WindowUtils.appSlug() ?? 'cli'].join('-');
  const [state, setState] = useLocalStorage<string[]>(key, []);

  const isPipelineConversionNotificationDisplayedFor = useCallback(
    (pipelineId: string) => state.includes(pipelineId),
    [state],
  );

  const displayPipelineConversionNotificationFor = useCallback(
    (pipelineId: string) => setState((prev) => (prev.includes(pipelineId) ? prev : [...prev, pipelineId])),
    [setState],
  );

  const hidePipelineConversionNotificationFor = useCallback(
    (pipelineId: string) => setState((prev) => prev.filter((id) => id !== pipelineId)),
    [setState],
  );

  return useMemo(
    () => ({
      isPipelineConversionNotificationDisplayedFor,
      displayPipelineConversionNotificationFor,
      hidePipelineConversionNotificationFor,
    }),
    [
      isPipelineConversionNotificationDisplayedFor,
      displayPipelineConversionNotificationFor,
      hidePipelineConversionNotificationFor,
    ],
  );
};

export default usePipelineConversionNotification;
