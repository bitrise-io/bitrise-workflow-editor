import { BitkitRibbon } from '@bitrise/bitkit-v2';

import usePipelineConversionNotification from '../../hooks/usePipelineConversionNotification';
import usePipelineSelector from '../../hooks/usePipelineSelector';

const PipelineConversionNotification = () => {
  const { selectedPipeline } = usePipelineSelector();

  const { isPipelineConversionNotificationDisplayedFor, hidePipelineConversionNotificationFor } =
    usePipelineConversionNotification();

  if (!isPipelineConversionNotificationDisplayedFor(selectedPipeline)) {
    return null;
  }

  return (
    <BitkitRibbon data-clarity-unmask="true" onDismiss={() => hidePipelineConversionNotificationFor(selectedPipeline)}>
      This Pipeline is based on a staged setup. Review artifact sharing and run conditions before running.
    </BitkitRibbon>
  );
};

export default PipelineConversionNotification;
