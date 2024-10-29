import 'reactflow/dist/style.css';
import { Box } from '@bitrise/bitkit';
import withQueryClientProvider from '@/utils/withQueryClientProvider';
import { BitriseYml } from '@/core/models/BitriseYml';
import BitriseYmlProvider from '@/contexts/BitriseYmlProvider';
import StagePipelineEmptyState from './components/PipelineCanvas/StagedPipelineCanvas/components/StagePipelineEmptyState';
import PipelineCanvas from './components/PipelineCanvas/PipelineCanvas';

type Props = {
  yml: BitriseYml;
};

const PipelinesPage = ({ yml }: Props) => {
  if (!yml) {
    return null;
  }

  const hasPipelines = Object.keys(yml.pipelines || {}).length > 0;

  return (
    <BitriseYmlProvider yml={yml}>
      <Box display="flex" flexDir="column" h="100%">
        {hasPipelines ? <PipelineCanvas /> : <StagePipelineEmptyState />}
      </Box>
    </BitriseYmlProvider>
  );
};

export default withQueryClientProvider(PipelinesPage);
