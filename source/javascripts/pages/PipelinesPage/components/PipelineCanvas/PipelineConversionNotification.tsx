import { Ribbon } from '@bitrise/bitkit';

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
    <Ribbon colorScheme="blue" onClose={() => hidePipelineConversionNotificationFor(selectedPipeline)}>
      This Pipeline is based on a staged setup. Review artifact sharing and run conditions before running.
    </Ribbon>
  );
};

export default PipelineConversionNotification;
