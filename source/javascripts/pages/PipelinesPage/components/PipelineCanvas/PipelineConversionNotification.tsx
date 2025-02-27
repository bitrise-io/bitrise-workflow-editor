import { Ribbon } from '@bitrise/bitkit';
import usePipelineConversionNotification from '../../hooks/usePipelineConversionNotification';

type Props = {
  pipelineId: string;
};

const PipelineConversionNotification = ({ pipelineId }: Props) => {
  const { isPipelineConversionNotificationDisplayedFor, hidePipelineConversionNotificationFor } =
    usePipelineConversionNotification();

  if (!isPipelineConversionNotificationDisplayedFor(pipelineId)) {
    return null;
  }

  return (
    <Ribbon colorScheme="blue" onClose={() => hidePipelineConversionNotificationFor(pipelineId)}>
      This Pipeline is based on a staged setup. Review artifact sharing and run conditions before running.
    </Ribbon>
  );
};

export default PipelineConversionNotification;
