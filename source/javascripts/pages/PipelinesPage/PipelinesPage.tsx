import 'reactflow/dist/style.css';
import { Box } from '@bitrise/bitkit';
import { BitriseYml } from '@/core/models/BitriseYml';
import BitriseYmlProvider from '@/contexts/BitriseYmlProvider';
import useFeatureFlag from '@/hooks/useFeatureFlag';
import usePipelineSelector from './hooks/usePipelineSelector';
import StagePipelineEmptyState from './components/PipelineCanvas/StagedPipelineCanvas/components/StagePipelineEmptyState';
import PipelineCanvas from './components/PipelineCanvas/PipelineCanvas';
import Drawers from './components/Drawers/Drawers';
import { usePipelinesPageStore, PipelineConfigDialogType } from './PipelinesPage.store';
import CreateFirstGraphPipelineEmptyState from './components/PipelineCanvas/GraphPipelineCanvas/components/CreateFirstGraphPipelineEmptyState';

type Props = {
  yml: BitriseYml;
  onChange: (yml: BitriseYml) => void;
};

const PipelinesPage = ({ yml, onChange }: Props) => {
  if (!yml) {
    return null;
  }

  return (
    <BitriseYmlProvider yml={yml} onChange={onChange}>
      <PipelinesPageContent />
    </BitriseYmlProvider>
  );
};

const PipelinesPageContent = () => {
  const { keys } = usePipelineSelector();
  const hasPipelines = keys.length > 0;

  return (
    <Drawers>
      <Box display="flex" flexDir="column" h="100%">
        {hasPipelines ? <PipelineCanvas /> : <EmptyState />}
      </Box>
    </Drawers>
  );
};

const EmptyState = () => {
  const isGraphPipelinesEnabled = useFeatureFlag('enable-dag-pipelines');
  const { openDialog } = usePipelinesPageStore();

  if (isGraphPipelinesEnabled) {
    return <CreateFirstGraphPipelineEmptyState onCreate={openDialog(PipelineConfigDialogType.CREATE_PIPELINE)} />;
  }

  return <StagePipelineEmptyState />;
};

export default PipelinesPage;
