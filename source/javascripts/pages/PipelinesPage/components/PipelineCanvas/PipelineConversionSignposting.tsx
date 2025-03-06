import { useCallback, useEffect, useMemo } from 'react';
import { Ribbon } from '@bitrise/bitkit';

import {
  trackConversionSignpostingBannerCtaClicked,
  trackConversionSignpostingBannerDismissed,
  trackConversionSignpostingBannerDisplayed,
} from '@/core/analytics/PipelineAnalytics';
import PipelineService from '@/core/services/PipelineService';
import { useBitriseYmlStoreApi } from '@/hooks/useBitriseYmlStore';

import usePipelineSelector from '../../hooks/usePipelineSelector';
import usePipelineConversionSignposting from '../../hooks/usePipelineConversionSignposting';
import usePipelineConversionNotification from '../../hooks/usePipelineConversionNotification';

const PipelineConversionSignposting = () => {
  const bitriseYmlStoreApi = useBitriseYmlStoreApi();
  const { selectedPipeline, onSelectPipeline } = usePipelineSelector();
  const pipeline = useMemo(
    () => PipelineService.getPipeline(selectedPipeline, bitriseYmlStoreApi.getState().yml),
    [bitriseYmlStoreApi, selectedPipeline],
  );
  const numberOfStages = useMemo(() => PipelineService.numberOfStages(pipeline ?? {}), [pipeline]);

  const { isPipelineConversionSignpostingHiddenFor, hidePipelineConversionSignpostingFor } =
    usePipelineConversionSignposting();

  const { displayPipelineConversionNotificationFor } = usePipelineConversionNotification();

  useEffect(() => {
    trackConversionSignpostingBannerDisplayed(selectedPipeline, numberOfStages);
  }, [selectedPipeline, numberOfStages]);

  const handleDismiss = useCallback(() => {
    hidePipelineConversionSignpostingFor(selectedPipeline);
    trackConversionSignpostingBannerDismissed(selectedPipeline, numberOfStages);
  }, [selectedPipeline, numberOfStages, hidePipelineConversionSignpostingFor]);

  const handleConvertClick = useCallback(() => {
    const pipelineIds = Object.keys(bitriseYmlStoreApi.getState().yml.pipelines ?? {});

    let suffix = 0;
    let newPipelineId = [selectedPipeline, 'converted'].join('_');
    while (pipelineIds.includes(newPipelineId)) {
      suffix += 1;
      newPipelineId = [selectedPipeline, 'converted', suffix].join('_');
    }

    bitriseYmlStoreApi.getState().createPipeline(newPipelineId, selectedPipeline);
    trackConversionSignpostingBannerCtaClicked(newPipelineId, selectedPipeline);

    if (PipelineService.hasStepInside(newPipelineId, 'pull-intermediate-files', bitriseYmlStoreApi.getState().yml)) {
      displayPipelineConversionNotificationFor(newPipelineId);
    }

    onSelectPipeline(newPipelineId);
  }, [bitriseYmlStoreApi, selectedPipeline, onSelectPipeline, displayPipelineConversionNotificationFor]);

  if (isPipelineConversionSignpostingHiddenFor(selectedPipeline)) {
    return null;
  }

  return (
    <Ribbon
      colorScheme="blue"
      onClose={handleDismiss}
      action={{ label: 'Convert Pipeline', onClick: handleConvertClick }}
    >
      This Pipeline is read-only. To edit its contents and access more flexible configuration options, convert it to a
      Graph Pipeline.
    </Ribbon>
  );
};

export default PipelineConversionSignposting;
