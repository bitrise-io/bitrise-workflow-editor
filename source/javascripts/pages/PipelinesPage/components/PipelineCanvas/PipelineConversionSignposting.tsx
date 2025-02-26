import { Ribbon } from '@bitrise/bitkit';
import { useBitriseYmlStoreApi } from '@/hooks/useBitriseYmlStore';

import usePipelineConversionSignposting from '../../hooks/usePipelineConversionSignposting';
import usePipelineSelector from '../../hooks/usePipelineSelector';

type Props = {
  pipelineId: string;
};

const PipelineConversionSignposting = ({ pipelineId }: Props) => {
  const bitriseYmlStoreApi = useBitriseYmlStoreApi();
  const { onSelectPipeline } = usePipelineSelector();
  const { isPipelineConversionSignpostingHiddenFor, hidePipelineConversionSignpostingFor } =
    usePipelineConversionSignposting();

  if (isPipelineConversionSignpostingHiddenFor(pipelineId)) {
    return null;
  }

  const onClickConvertButton = () => {
    const pipelineIds = Object.keys(bitriseYmlStoreApi.getState().yml.pipelines ?? {});

    let suffix = 0;
    let newPipelineName = [pipelineId, 'converted'].join('_');
    while (pipelineIds.includes(newPipelineName)) {
      suffix += 1;
      newPipelineName = [pipelineId, 'converted', suffix].join('_');
    }

    bitriseYmlStoreApi.getState().createPipeline(newPipelineName, pipelineId);
    onSelectPipeline(newPipelineName);
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
