import { PropsWithChildren } from 'react';
import { PipelineConfigDialogType, usePipelinesPageStore } from '../../PipelinesPage.store';
import PipelineConfigDrawer from '../PipelineConfigDrawer/PipelineConfigDrawer';

const Drawers = ({ children }: PropsWithChildren) => {
  const { pipelineId, isDialogMounted, isDialogOpen, closeDialog, unmountDialog } = usePipelinesPageStore();

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
    </>
  );
};

export default Drawers;
