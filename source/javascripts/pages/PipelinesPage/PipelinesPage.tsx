import 'reactflow/dist/style.css';
import { Box } from '@bitrise/bitkit';
import { BitriseYml } from '@/core/models/BitriseYml';
import BitriseYmlProvider from '@/contexts/BitriseYmlProvider';
import StagePipelineEmptyState from './components/PipelineCanvas/StagedPipelineCanvas/components/StagePipelineEmptyState';
import PipelineCanvas from './components/PipelineCanvas/PipelineCanvas';
import Drawers from './components/Drawers/Drawers';

type Props = {
  yml: BitriseYml;
  onChange: (yml: BitriseYml) => void;
};

const PipelinesPage = ({ yml, onChange }: Props) => {
  if (!yml) {
    return null;
  }

  const hasPipelines = Object.keys(yml.pipelines || {}).length > 0;

  return (
    <BitriseYmlProvider yml={yml} onChange={onChange}>
      <Drawers>
        <Box display="flex" flexDir="column" h="100%">
          {hasPipelines ? <PipelineCanvas /> : <StagePipelineEmptyState />}
        </Box>
      </Drawers>
    </BitriseYmlProvider>
  );
};

export default PipelinesPage;
