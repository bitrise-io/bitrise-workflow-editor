import { memo, useEffect, useMemo, useRef } from 'react';
import { Box, CardProps } from '@bitrise/bitkit';
import { NodeProps, useReactFlow } from '@xyflow/react';
import { useHover, useResizeObserver } from 'usehooks-ts';
import useFeatureFlag from '@/hooks/useFeatureFlag';
import { WorkflowCard } from '@/components/unified-editor';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

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
  const openDialog = usePipelinesPageStore((s) => s.openDialog);
  const selectedWorkflowId = usePipelinesPageStore((s) => s.workflowId);
  const selectedStepIndex = usePipelinesPageStore((s) => s.stepIndex);

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
    handleClonseStep,
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
      handleMoveStep: moveStep,
      handleSelectStep: (workflowId: string, stepIndex: number) =>
        openDialog({
          type: PipelinesPageDialogType.STEP_CONFIG,
          pipelineId: selectedPipeline,
          workflowId,
          stepIndex,
        })(),
      handleClonseStep: cloneStep,
      handleDeleteStep: deleteStep,
      handleUpgradeStep: upgradeStep,
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
      handleRemoveChainedWorkflow: removeChainedWorkflow,
      handleChainedWorkflowsUpdate: setChainedWorkflows,
    };
  }, [
    moveStep,
    cloneStep,
    openDialog,
    deleteStep,
    upgradeStep,
    deleteElements,
    selectedPipeline,
    setChainedWorkflows,
    removeChainedWorkflow,
    isGraphPipelinesEnabled,
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
        onCloneStep={handleClonseStep}
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
