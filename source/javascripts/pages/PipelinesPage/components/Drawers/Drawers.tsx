import { PropsWithChildren } from 'react';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { PipelineConfigDialogType, usePipelinesPageStore } from '../../PipelinesPage.store';
import PipelineConfigDrawer from '../PipelineConfigDrawer/PipelineConfigDrawer';
import CreatePipelineDialog from '../CreatePipelineDialog/CreatePipelineDialog';
import DeletePipelineDialog from '../DeletePipelineDialog/DeletePipelineDialog';

const Drawers = ({ children }: PropsWithChildren) => {
  const { pipelineId, isDialogMounted, isDialogOpen, closeDialog, unmountDialog } = usePipelinesPageStore();
  const { createPipeline, deletePipeline } = useBitriseYmlStore((s) => ({
    createPipeline: s.createPipeline,
    deletePipeline: s.deletePipeline,
  }));

  return (
    <>
      {children}

      {isDialogMounted(PipelineConfigDialogType.PIPELINE_CONFIG) && (
        <PipelineConfigDrawer
          pipelineId={pipelineId}
          isOpen={isDialogOpen(PipelineConfigDialogType.PIPELINE_CONFIG)}
          onClose={closeDialog}
          onCloseComplete={unmountDialog}
        />
      )}

      {isDialogMounted(PipelineConfigDialogType.CREATE_PIPELINE) && (
        <CreatePipelineDialog
          isOpen={isDialogOpen(PipelineConfigDialogType.CREATE_PIPELINE)}
          onClose={closeDialog}
          onCloseComplete={unmountDialog}
          onCreatePipeline={createPipeline}
        />
      )}
      {isDialogMounted(PipelineConfigDialogType.DELETE_PIPELINE) && (
        <DeletePipelineDialog
          isOpen={isDialogOpen(PipelineConfigDialogType.DELETE_PIPELINE)}
          onClose={closeDialog}
          onCloseComplete={unmountDialog}
          onDeletePipeline={deletePipeline}
        />
      )}
    </>
  );
};

export default Drawers;
