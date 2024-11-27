import { memo, useEffect, useMemo, useRef } from 'react';
import { Box, CardProps } from '@bitrise/bitkit';
import { NodeProps, useReactFlow } from '@xyflow/react';
import { useHover, useResizeObserver } from 'usehooks-ts';
import useFeatureFlag from '@/hooks/useFeatureFlag';
import { WorkflowCard } from '@/components/unified-editor';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

import { WORKFLOW_NODE_WIDTH } from '../GraphPipelineCanvas.const';
import usePipelineSelector from '../../../../hooks/usePipelineSelector';
import { GraphPipelineNodeType, GraphPipelineEdgeType } from '../GraphPipelineCanvas.types';
import { usePipelinesPageStore, PipelinesPageDialogType } from '../../../../PipelinesPage.store';
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
  const { openDialog } = usePipelinesPageStore();
  const { selectedPipeline } = usePipelineSelector();
  const isGraphPipelinesEnabled = useFeatureFlag('enable-dag-pipelines');
  const { updateNode, deleteElements, setEdges } = useReactFlow<GraphPipelineNodeType, GraphPipelineEdgeType>();

  const { moveStep, cloneStep, deleteStep, upgradeStep, setChainedWorkflows } = useBitriseYmlStore((s) => ({
    moveStep: s.moveStep,
    cloneStep: s.cloneStep,
    deleteStep: s.deleteStep,
    upgradeStep: s.changeStepVersion,
    setChainedWorkflows: s.setChainedWorkflows,
  }));

  useResizeObserver({ ref, onResize: ({ height }) => updateNode(id, { height }) });

  const handleAddStep = useMemo(() => {
    if (!isGraphPipelinesEnabled) {
      return undefined;
    }

    return (workflowId: string, stepIndex: number) => {
      openDialog(PipelinesPageDialogType.STEP_SELECTOR, selectedPipeline, workflowId, stepIndex)();
    };
  }, [isGraphPipelinesEnabled, openDialog, selectedPipeline]);

  const handleSelectStep = useMemo(() => {
    if (!isGraphPipelinesEnabled) {
      return undefined;
    }

    return (workflowId: string, stepIndex: number) => {
      openDialog(PipelinesPageDialogType.STEP_CONFIG, selectedPipeline, workflowId, stepIndex)();
    };
  }, [isGraphPipelinesEnabled, openDialog, selectedPipeline]);

  const handleClonseStep = useMemo(() => {
    if (!isGraphPipelinesEnabled) {
      return undefined;
    }

    return cloneStep;
  }, [isGraphPipelinesEnabled, cloneStep]);

  const handleDeleteStep = useMemo(() => {
    if (!isGraphPipelinesEnabled) {
      return undefined;
    }

    return deleteStep;
  }, [isGraphPipelinesEnabled, deleteStep]);

  const handleUpgradeStep = useMemo(() => {
    if (!isGraphPipelinesEnabled) {
      return undefined;
    }

    return upgradeStep;
  }, [isGraphPipelinesEnabled, upgradeStep]);

  const handleEditWorkflow = useMemo(() => {
    if (!isGraphPipelinesEnabled) {
      return undefined;
    }

    return (workflowId: string) => {
      openDialog(PipelinesPageDialogType.WORKFLOW_CONFIG, selectedPipeline, workflowId)();
    };
  }, [isGraphPipelinesEnabled, openDialog, selectedPipeline]);

  const handleRemoveWorkflow = useMemo(() => {
    if (!isGraphPipelinesEnabled) {
      return undefined;
    }

    return (workflowId: string) => {
      deleteElements({ nodes: [{ id: workflowId }] });
    };
  }, [deleteElements, isGraphPipelinesEnabled]);

  const handleChainedWorkflowsUpdate = useMemo(() => {
    if (!isGraphPipelinesEnabled) {
      return undefined;
    }

    return setChainedWorkflows;
  }, [isGraphPipelinesEnabled, setChainedWorkflows]);

  const containerProps = useMemo(
    () => ({ ...defaultStyle, ...(selected ? selectedStyle : {}), ...(hovered ? hoveredStyle : {}) }),
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
        /* TODO needs plumbing
        onCreateWorkflow={]
        onChainWorkflow={}
        onChainChainedWorkflow={}
        onChainedWorkflowsUpdate={}
        */
        onMoveStep={moveStep}
        onAddStep={handleAddStep}
        onCloneStep={handleClonseStep}
        onSelectStep={handleSelectStep}
        onDeleteStep={handleDeleteStep}
        onUpgradeStep={handleUpgradeStep}
        onEditWorkflow={handleEditWorkflow}
        // onEditChainedWorkflow={openEditWorkflowDialog}
        onRemoveWorkflow={handleRemoveWorkflow}
        // onRemoveChainedWorkflow={removeChainedWorkflow}
        onChainedWorkflowsUpdate={handleChainedWorkflowsUpdate}
      />
      <RightHandle />
    </Box>
  );
};

export default memo(WorkflowNode);
