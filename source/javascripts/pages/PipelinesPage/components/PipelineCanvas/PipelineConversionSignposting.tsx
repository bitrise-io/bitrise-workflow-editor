import { Ribbon } from '@bitrise/bitkit';
import { useCallback, useEffect, useMemo } from 'react';

import {
  trackConvertPipelineBannerCtaClicked,
  trackConvertPipelineBannerDismissed,
  trackConvertPipelineBannerDisplayed,
} from '@/core/analytics/PipelineAnalytics';
import PipelineService from '@/core/services/PipelineService';
import { getBitriseYml } from '@/core/stores/BitriseYmlStore';

import usePipelineConversionNotification from '../../hooks/usePipelineConversionNotification';
import usePipelineConversionSignposting from '../../hooks/usePipelineConversionSignposting';
import usePipelineSelector from '../../hooks/usePipelineSelector';

const PipelineConversionSignposting = () => {
  const { selectedPipeline, onSelectPipeline } = usePipelineSelector();
  const numberOfStages = useMemo(() => {
    const pipeline = PipelineService.getPipeline(selectedPipeline, getBitriseYml());
    return PipelineService.numberOfStages(pipeline ?? {});
  }, [selectedPipeline]);

  const { isPipelineConversionSignpostingHiddenFor, hidePipelineConversionSignpostingFor } =
    usePipelineConversionSignposting();

  const { displayPipelineConversionNotificationFor } = usePipelineConversionNotification();

  useEffect(() => {
    if (!isPipelineConversionSignpostingHiddenFor(selectedPipeline)) {
      trackConvertPipelineBannerDisplayed(selectedPipeline, numberOfStages);
    }
  }, [selectedPipeline, numberOfStages, isPipelineConversionSignpostingHiddenFor]);

  const handleDismiss = useCallback(() => {
    hidePipelineConversionSignpostingFor(selectedPipeline);
    trackConvertPipelineBannerDismissed(selectedPipeline, numberOfStages);
  }, [selectedPipeline, numberOfStages, hidePipelineConversionSignpostingFor]);

  const handleConvertClick = useCallback(() => {
    const pipelineIds = Object.keys(getBitriseYml().pipelines ?? {});

    let suffix = 0;
    let newPipelineId = [selectedPipeline, 'converted'].join('_');
    while (pipelineIds.includes(newPipelineId)) {
      suffix += 1;
      newPipelineId = [selectedPipeline, 'converted', suffix].join('_');
    }

    PipelineService.createPipeline(newPipelineId, selectedPipeline);
    trackConvertPipelineBannerCtaClicked(newPipelineId, selectedPipeline);

    if (PipelineService.hasStepInside(newPipelineId, 'pull-intermediate-files', getBitriseYml())) {
      displayPipelineConversionNotificationFor(newPipelineId);
    }

    onSelectPipeline(newPipelineId);
  }, [selectedPipeline, onSelectPipeline, displayPipelineConversionNotificationFor]);

  if (isPipelineConversionSignpostingHiddenFor(selectedPipeline)) {
    return null;
  }

  return (
    <Ribbon
      colorScheme="blue"
      onClose={handleDismiss}
      action={{
        label: 'Convert Pipeline',
        onClick: handleConvertClick,
        alignSelf: 'center',
      }}
    >
      This Pipeline is read-only. To edit its contents and access more flexible configuration options, convert it to a
      Graph Pipeline.
    </Ribbon>
  );
};

export default PipelineConversionSignposting;
