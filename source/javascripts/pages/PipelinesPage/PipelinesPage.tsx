import 'reactflow/dist/style.css';
import { Box } from '@bitrise/bitkit';
import withQueryClientProvider from '@/utils/withQueryClientProvider';
import { BitriseYml } from '@/core/models/BitriseYml';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import BitriseYmlProvider from '@/contexts/BitriseYmlProvider';
import CreatePipelineDialog from './components/CreatePipelineDialog/CreatePipelineDialog';
import StagePipelineEmptyState from './components/PipelineCanvas/StagedPipelineCanvas/components/StagePipelineEmptyState';
import PipelineCanvas from './components/PipelineCanvas/PipelineCanvas';
import { usePipelinesPageStore } from './PipelinesPage.store';

type Props = {
  yml: BitriseYml;
  onChange: (yml: BitriseYml) => void; // Do we need this?
};

const PipelinesPageContent = () => {
  const { isDialogOpen, closeDialog } = usePipelinesPageStore();
  const { isCreatePipelineDialogOpen } = {
    isCreatePipelineDialogOpen: isDialogOpen === 'create-pipeline',
  };
  const { createPipeline } = useBitriseYmlStore((s) => ({
    createPipeline: s.createPipeline,
  }));

  return (
    <>
      <Box display="flex" flexDir="column" h="100%">
        <PipelineCanvas />
      </Box>

      <CreatePipelineDialog
        isOpen={isCreatePipelineDialogOpen}
        onClose={closeDialog}
        onCreatePipeline={createPipeline}
      />
    </>
  );
};

const PipelinesPage = ({ yml, onChange }: Props) => {
  if (!yml) {
    return null;
  }

  const hasPipelines = Object.keys(yml.pipelines || {}).length > 0;
  return (
    <BitriseYmlProvider yml={yml} onChange={onChange}>
      <Box display="flex" flexDir="column" h="100%">
        {hasPipelines ? <PipelinesPageContent /> : <StagePipelineEmptyState />}
      </Box>
    </BitriseYmlProvider>
  );
};

export default withQueryClientProvider(PipelinesPage);
