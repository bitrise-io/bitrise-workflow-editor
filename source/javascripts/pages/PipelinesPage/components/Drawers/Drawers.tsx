import { PropsWithChildren } from 'react';
import { useReactFlow } from '@xyflow/react';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { WorkflowConfigDrawer } from '@/components/unified-editor';
import { PipelineConfigDialogType, usePipelinesPageStore } from '../../PipelinesPage.store';
import PipelineConfigDrawer from '../PipelineConfigDrawer/PipelineConfigDrawer';
import CreatePipelineDialog from '../CreatePipelineDialog/CreatePipelineDialog';
import WorkflowSelectorDrawer from '../WorkflowSelectorDrawer/WorkflowSelectorDrawer';
import createNodeFromPipelineWorkflow from '../PipelineCanvas/GraphPipelineCanvas/utils/createNodeFromPipelineWorkflow';
import createGraphEdge from '../PipelineCanvas/GraphPipelineCanvas/utils/createGraphEdge';
import usePipelineWorkflows from '../PipelineCanvas/GraphPipelineCanvas/hooks/usePipelineWorkflows';
import transformWorkflowsToNodesAndEdges from '../PipelineCanvas/GraphPipelineCanvas/utils/transformWorkflowsToNodesAndEdges';

const Drawers = ({ children }: PropsWithChildren) => {
  const workflows = usePipelineWorkflows();
  const { addNodes, addEdges, setNodes, setEdges } = useReactFlow();
  const { pipelineId, workflowId, isDialogMounted, isDialogOpen, closeDialog, unmountDialog } = usePipelinesPageStore();

  const { createPipeline, addWorkflowToPipeline } = useBitriseYmlStore((s) => ({
    createPipeline: s.createPipeline,
    addWorkflowToPipeline: s.addWorkflowToPipeline,
  }));

  const handleAddWorkflowToPipeline = (selectedWorkflowId: string) => {
    addWorkflowToPipeline(pipelineId, selectedWorkflowId, workflowId);

    const dependsOn = workflowId ? [workflowId] : [];
    addNodes(createNodeFromPipelineWorkflow({ id: selectedWorkflowId, dependsOn }, pipelineId));

    if (workflowId) {
      addEdges(createGraphEdge(workflowId, selectedWorkflowId));
    }

    closeDialog();
  };

  const handleRenameWorkflow = () => {
    const { nodes, edges } = transformWorkflowsToNodesAndEdges(pipelineId, workflows);
    setNodes(nodes);
    setEdges(edges);
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

      {isDialogMounted(PipelineConfigDialogType.WORKFLOW_CONFIG) && (
        <WorkflowConfigDrawer
          workflowId={workflowId}
          onRename={handleRenameWorkflow}
          isOpen={isDialogOpen(PipelineConfigDialogType.WORKFLOW_CONFIG)}
          onClose={closeDialog}
          onCloseComplete={unmountDialog}
        />
      )}
    </>
  );
};

export default Drawers;
