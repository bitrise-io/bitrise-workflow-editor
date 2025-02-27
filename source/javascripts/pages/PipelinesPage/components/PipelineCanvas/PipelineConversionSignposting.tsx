import { Ribbon } from '@bitrise/bitkit';

import PipelineService from '@/core/services/PipelineService';
import { useBitriseYmlStoreApi } from '@/hooks/useBitriseYmlStore';

import usePipelineSelector from '../../hooks/usePipelineSelector';
import usePipelineConversionSignposting from '../../hooks/usePipelineConversionSignposting';
import usePipelineConversionNotification from '../../hooks/usePipelineConversionNotification';

type Props = {
  pipelineId: string;
};

const PipelineConversionSignposting = ({ pipelineId }: Props) => {
  const bitriseYmlStoreApi = useBitriseYmlStoreApi();
  const { onSelectPipeline } = usePipelineSelector();

  const { isPipelineConversionSignpostingHiddenFor, hidePipelineConversionSignpostingFor } =
    usePipelineConversionSignposting();

  const { displayPipelineConversionNotificationFor } = usePipelineConversionNotification();

  if (isPipelineConversionSignpostingHiddenFor(pipelineId)) {
    return null;
  }

  const onClickConvertButton = () => {
    const pipelineIds = Object.keys(bitriseYmlStoreApi.getState().yml.pipelines ?? {});

    let suffix = 0;
    let newPipelineId = [pipelineId, 'converted'].join('_');
    while (pipelineIds.includes(newPipelineId)) {
      suffix += 1;
      newPipelineId = [pipelineId, 'converted', suffix].join('_');
    }

    bitriseYmlStoreApi.getState().createPipeline(newPipelineId, pipelineId);

    if (PipelineService.hasStepInside(newPipelineId, 'pull-intermediate-files', bitriseYmlStoreApi.getState().yml)) {
      displayPipelineConversionNotificationFor(newPipelineId);
    }

    onSelectPipeline(newPipelineId);
  };

  return (
    <Ribbon
      colorScheme="blue"
      onClose={() => hidePipelineConversionSignpostingFor(pipelineId)}
      action={{ label: 'Convert Pipeline', onClick: onClickConvertButton }}
    >
      This Pipeline is read-only. To edit its contents and access more flexible configuration options, convert it to a
      Graph Pipeline.
    </Ribbon>
  );
};

export default PipelineConversionSignposting;
