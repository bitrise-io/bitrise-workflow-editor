import { memo, useEffect, useMemo, useRef } from 'react';
import { Box, CardProps } from '@bitrise/bitkit';
import { NodeProps, useReactFlow } from '@xyflow/react';
import { useHover, useResizeObserver } from 'usehooks-ts';
import useFeatureFlag from '@/hooks/useFeatureFlag';
import { WorkflowCard } from '@/components/unified-editor';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

import { ChainedWorkflowPlacement } from '@/core/models/Workflow';
import WorkflowService from '@/core/models/WorkflowService';
import { useWorkflows } from '@/hooks/useWorkflows';
import { WORKFLOW_NODE_WIDTH } from '../GraphPipelineCanvas.const';
import usePipelineSelector from '../../../../hooks/usePipelineSelector';
import { GraphPipelineEdgeType, GraphPipelineNodeType } from '../GraphPipelineCanvas.types';
import { PipelinesPageDialogType, usePipelinesPageStore } from '../../../../PipelinesPage.store';
import { LeftHandle, RightHandle } from './Handles';

type Props = NodeProps<GraphPipelineNodeType>;

const defaultStyle = {
  variant: 'outline',
} satisfies CardProps;

const hoveredStyle = {
  boxShadow: 'small',
  borderColor: 'border/hover',
} satisfies CardProps;

const selectedStyle = {
  outline: '2px solid',
  outlineColor: 'border/selected',
  outlineOffset: '-2px',
} satisfies CardProps;

const WorkflowNode = ({ id, zIndex, selected }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const hovered = useHover(ref);
  const workflows = useWorkflows();
  const openDialog = usePipelinesPageStore((s) => s.openDialog);
  const closeDialog = usePipelinesPageStore((s) => s.closeDialog);
  const selectedWorkflowId = usePipelinesPageStore((s) => s.workflowId);
  const selectedStepIndex = usePipelinesPageStore((s) => s.stepIndex);
  const setStepIndex = usePipelinesPageStore((s) => s.setStepIndex);

  const { selectedPipeline } = usePipelineSelector();
  const isGraphPipelinesEnabled = useFeatureFlag('enable-dag-pipelines');
  const { updateNode, deleteElements, setEdges } = useReactFlow<GraphPipelineNodeType, GraphPipelineEdgeType>();

  const { moveStep, cloneStep, deleteStep, upgradeStep, setChainedWorkflows, removeChainedWorkflow } =
    useBitriseYmlStore((s) => ({
      moveStep: s.moveStep,
      cloneStep: s.cloneStep,
      deleteStep: s.deleteStep,
      upgradeStep: s.changeStepVersion,
      setChainedWorkflows: s.setChainedWorkflows,
      removeChainedWorkflow: s.removeChainedWorkflow,
    }));

  useResizeObserver({
    ref,
    onResize: ({ height }) => updateNode(id, { height }),
  });

  const {
    handleAddStep,
    handleMoveStep,
    handleSelectStep,
    handleCloneStep,
    handleDeleteStep,
    handleUpgradeStep,
    handleEditWorkflow,
    handleChainWorkflow,
    handleRemoveWorkflow,
    handleRemoveChainedWorkflow,
    handleChainedWorkflowsUpdate,
  } = useMemo(() => {
    if (!isGraphPipelinesEnabled) {
      return {};
    }

    return {
      handleAddStep: (workflowId: string, stepIndex: number) =>
        openDialog({
          type: PipelinesPageDialogType.STEP_SELECTOR,
          pipelineId: selectedPipeline,
          workflowId,
          stepIndex,
        })(),
      handleSelectStep: (workflowId: string, stepIndex: number) =>
        openDialog({
          type: PipelinesPageDialogType.STEP_CONFIG,
          pipelineId: selectedPipeline,
          workflowId,
          stepIndex,
        })(),
      handleUpgradeStep: upgradeStep,
      handleMoveStep: (workflowId: string, stepIndex: number, targetIndex: number) => {
        moveStep(workflowId, stepIndex, targetIndex);

        // Adjust index if the selected step is moved
        if (workflowId === selectedWorkflowId && selectedStepIndex === stepIndex) {
          setStepIndex(targetIndex);
        }
      },
      handleCloneStep: (workflowId: string, stepIndex: number) => {
        cloneStep(workflowId, stepIndex);

        // Adjust index if the selected step is cloned
        if (workflowId === selectedWorkflowId && stepIndex === selectedStepIndex) {
          setStepIndex(selectedStepIndex + 1);
        }
      },
      handleDeleteStep: (workflowId: string, stepIndex: number) => {
        deleteStep(workflowId, stepIndex);

        // Close the dialog if the selected step is deleted
        if (workflowId === selectedWorkflowId && stepIndex === selectedStepIndex) {
          closeDialog();
        }

        // Adjust index if a step is deleted before the selected step
        if (workflowId === selectedWorkflowId && stepIndex < selectedStepIndex) {
          setStepIndex(selectedStepIndex - 1);
        }
      },
      handleEditWorkflow: (workflowId: string) =>
        openDialog({
          type: PipelinesPageDialogType.WORKFLOW_CONFIG,
          pipelineId: selectedPipeline,
          workflowId,
        })(),
      handleChainWorkflow: (workflowId: string) =>
        openDialog({
          type: PipelinesPageDialogType.CHAIN_WORKFLOW,
          pipelineId: selectedPipeline,
          workflowId,
        })(),
      handleRemoveWorkflow: (workflowId: string) => deleteElements({ nodes: [{ id: workflowId }] }),
      handleChainedWorkflowsUpdate: (
        parentWorkflowId: string,
        placement: ChainedWorkflowPlacement,
        chainedIds: string[],
      ) => {
        setChainedWorkflows(parentWorkflowId, placement, chainedIds);
      },
      handleRemoveChainedWorkflow: (
        parentWorkflowId: string,
        placement: ChainedWorkflowPlacement,
        deletedWorkflowId: string,
        deletedWorkflowIndex: number,
      ) => {
        removeChainedWorkflow(parentWorkflowId, placement, deletedWorkflowId, deletedWorkflowIndex);

        // Close the dialog if the selected workflow is deleted
        if (deletedWorkflowId === selectedWorkflowId) {
          closeDialog();
        }

        // Close the dialog if the selected workflow is chained to the deleted workflow
        if (WorkflowService.getWorkflowChain(workflows, deletedWorkflowId).includes(selectedWorkflowId)) {
          closeDialog();
        }
      },
    };
  }, [
    isGraphPipelinesEnabled,
    moveStep,
    cloneStep,
    upgradeStep,
    openDialog,
    selectedPipeline,
    deleteStep,
    selectedWorkflowId,
    selectedStepIndex,
    closeDialog,
    setStepIndex,
    deleteElements,
    removeChainedWorkflow,
    workflows,
    setChainedWorkflows,
  ]);

  const containerProps = useMemo(
    () => ({
      ...defaultStyle,
      ...(selected ? selectedStyle : {}),
      ...(hovered ? hoveredStyle : {}),
    }),
    [selected, hovered],
  );

  const highlighted = selected || hovered;

  useEffect(() => {
    setEdges((edges) => {
      return edges.map((edge) => {
        if (edge.target === id) {
          return { ...edge, data: { ...edge.data, highlighted } };
        }

        return edge;
      });
    });
  }, [id, highlighted, setEdges]);

  return (
    <Box ref={ref} display="flex" zIndex={zIndex} alignItems="stretch" w={WORKFLOW_NODE_WIDTH} className="nopan">
      <LeftHandle />
      <WorkflowCard
        id={id}
        isCollapsable
        containerProps={containerProps}
        selectedWorkflowId={selectedWorkflowId}
        selectedStepIndex={selectedStepIndex}
        /* TODO needs plumbing
        onCreateWorkflow={}
        */
        onAddStep={handleAddStep}
        onMoveStep={handleMoveStep}
        onCloneStep={handleCloneStep}
        onSelectStep={handleSelectStep}
        onDeleteStep={handleDeleteStep}
        onUpgradeStep={handleUpgradeStep}
        onEditWorkflow={handleEditWorkflow}
        onChainWorkflow={handleChainWorkflow}
        onRemoveWorkflow={handleRemoveWorkflow}
        onEditChainedWorkflow={handleEditWorkflow}
        onChainChainedWorkflow={handleChainWorkflow}
        onRemoveChainedWorkflow={handleRemoveChainedWorkflow}
        onChainedWorkflowsUpdate={handleChainedWorkflowsUpdate}
      />
      <RightHandle />
    </Box>
  );
};

export default memo(WorkflowNode);
