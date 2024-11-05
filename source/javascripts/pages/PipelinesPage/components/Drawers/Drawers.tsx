import { PropsWithChildren } from 'react';
import { useReactFlow } from '@xyflow/react';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { PipelineConfigDialogType, usePipelinesPageStore } from '../../PipelinesPage.store';
import PipelineConfigDrawer from '../PipelineConfigDrawer/PipelineConfigDrawer';
import CreatePipelineDialog from '../CreatePipelineDialog/CreatePipelineDialog';
import WorkflowSelectorDrawer from '../WorkflowSelectorDrawer/WorkflowSelectorDrawer';
import transformWorkflowsToNodesAndEdges from '../PipelineCanvas/GraphPipelineCanvas/utils/transformWorkflowsToNodesAndEdges';

const Drawers = ({ children }: PropsWithChildren) => {
  const { addNodes } = useReactFlow();
  const { pipelineId, isDialogMounted, isDialogOpen, closeDialog, unmountDialog } = usePipelinesPageStore();

  const { createPipeline, addWorkflowToPipeline } = useBitriseYmlStore((s) => ({
    createPipeline: s.createPipeline,
    addWorkflowToPipeline: s.addWorkflowToPipeline,
  }));

  const handleAddWorkflowToPipeline = (workflowId: string) => {
    const { nodes } = transformWorkflowsToNodesAndEdges([{ id: workflowId, dependsOn: [] }], { x: -9999, y: 0 });
    addWorkflowToPipeline(pipelineId, workflowId);
    addNodes(nodes);
  };

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

      {isDialogMounted(PipelineConfigDialogType.WORKFLOW_SELECTOR) && (
        <WorkflowSelectorDrawer
          pipelineId={pipelineId}
          isOpen={isDialogOpen(PipelineConfigDialogType.WORKFLOW_SELECTOR)}
          onClose={closeDialog}
          onCloseComplete={unmountDialog}
          onSelectWorkflow={handleAddWorkflowToPipeline}
        />
      )}
    </>
  );
};

export default Drawers;
