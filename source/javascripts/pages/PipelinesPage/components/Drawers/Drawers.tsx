import { PropsWithChildren } from 'react';
import { useReactFlow } from '@xyflow/react';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { StartBuildDialog, WorkflowConfigDrawer } from '@/components/unified-editor';
import useSearchParams from '@/hooks/useSearchParams';
import useFeatureFlag from '@/hooks/useFeatureFlag';
import { PipelineConfigDialogType, usePipelinesPageStore } from '../../PipelinesPage.store';
import PipelineConfigDrawer from '../PipelineConfigDrawer/PipelineConfigDrawer';
import CreatePipelineDialog from '../CreatePipelineDialog/CreatePipelineDialog';
import WorkflowSelectorDrawer from '../WorkflowSelectorDrawer/WorkflowSelectorDrawer';
import createNodeFromPipelineWorkflow from '../PipelineCanvas/GraphPipelineCanvas/utils/createNodeFromPipelineWorkflow';
import createGraphEdge from '../PipelineCanvas/GraphPipelineCanvas/utils/createGraphEdge';
import usePipelineWorkflows from '../PipelineCanvas/GraphPipelineCanvas/hooks/usePipelineWorkflows';
import transformWorkflowsToNodesAndEdges from '../PipelineCanvas/GraphPipelineCanvas/utils/transformWorkflowsToNodesAndEdges';

const Drawers = ({ children }: PropsWithChildren) => {
  const isGraphPipelinesEnabled = useFeatureFlag('enable-dag-pipelines');
  const workflows = usePipelineWorkflows();
  const [, setSearchParams] = useSearchParams();
  const { addNodes, addEdges, setNodes, setEdges } = useReactFlow();
  const { pipelineId, workflowId, isDialogMounted, isDialogOpen, closeDialog, unmountDialog, setWorkflowId } =
    usePipelinesPageStore();

  const { createPipeline, addWorkflowToPipeline } = useBitriseYmlStore((s) => ({
    createPipeline: s.createPipeline,
    addWorkflowToPipeline: s.addWorkflowToPipeline,
  }));

  const handleAddWorkflowToPipeline = (selectedWorkflowId: string) => {
    addWorkflowToPipeline(pipelineId, selectedWorkflowId, workflowId);

    const dependsOn = workflowId ? [workflowId] : [];
    addNodes(
      createNodeFromPipelineWorkflow({ id: selectedWorkflowId, dependsOn }, pipelineId, isGraphPipelinesEnabled),
    );

    if (workflowId) {
      addEdges(createGraphEdge(workflowId, selectedWorkflowId, isGraphPipelinesEnabled));
    }

    closeDialog();
  };

  const handleRenameWorkflow = (newWorkflowId: string) => {
    setWorkflowId(newWorkflowId);
    setSearchParams((params) => {
      if (params.workflow_id === workflowId) {
        return { ...params, workflow_id: newWorkflowId };
      }
      return params;
    });
    const { nodes, edges } = transformWorkflowsToNodesAndEdges(pipelineId, workflows, isGraphPipelinesEnabled);
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
          context="pipeline"
          workflowId={workflowId}
          onRename={handleRenameWorkflow}
          isOpen={isDialogOpen(PipelineConfigDialogType.WORKFLOW_CONFIG)}
          onClose={closeDialog}
          onCloseComplete={unmountDialog}
        />
      )}

      {isDialogMounted(PipelineConfigDialogType.START_BUILD) && (
        <StartBuildDialog
          pipelineId={pipelineId}
          isOpen={isDialogOpen(PipelineConfigDialogType.START_BUILD)}
          onClose={closeDialog}
          onCloseComplete={unmountDialog}
        />
      )}
    </>
  );
};

export default Drawers;
