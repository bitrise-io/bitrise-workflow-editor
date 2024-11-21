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
import { usePipelinesPageStore, PipelineConfigDialogType } from '../../../../PipelinesPage.store';
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

  const { moveStep } = useBitriseYmlStore((s) => ({
    moveStep: s.moveStep,
  }));

  useResizeObserver({ ref, onResize: ({ height }) => updateNode(id, { height }) });

  const handleAddStep = useMemo(() => {
    if (!isGraphPipelinesEnabled) {
      return undefined;
    }

    return (workflowId: string, stepIndex: number) => {
      openDialog(PipelineConfigDialogType.STEP_SELECTOR, selectedPipeline, workflowId, stepIndex)();
    };
  }, [isGraphPipelinesEnabled, openDialog, selectedPipeline]);

  const handleSelectStep = useMemo(() => {
    if (!isGraphPipelinesEnabled) {
      return undefined;
    }

    return (workflowId: string, stepIndex: number) => {
      openDialog(PipelineConfigDialogType.STEP_CONFIG, selectedPipeline, workflowId, stepIndex)();
    };
  }, [isGraphPipelinesEnabled, openDialog, selectedPipeline]);

  const handleEditWorkflow = useMemo(() => {
    if (!isGraphPipelinesEnabled) {
      return undefined;
    }

    return (workflowId: string) => {
      openDialog(PipelineConfigDialogType.WORKFLOW_CONFIG, selectedPipeline, workflowId)();
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
<<<<<<< HEAD
        onSelectStep={}
=======
        onMoveStep={}
>>>>>>> master
        onUpgradeStep={}
        onCloneStep={}
        onDeleteStep={}
        onCreateWorkflow={]
        onChainWorkflow={}
        onChainChainedWorkflow={}
        onChainedWorkflowsUpdate={}
        */
        onMoveStep={moveStep}
        onAddStep={handleAddStep}
        onSelectStep={handleSelectStep}
        onEditWorkflow={handleEditWorkflow}
        // onEditChainedWorkflow={openEditWorkflowDialog}
        onRemoveWorkflow={handleRemoveWorkflow}
        // onRemoveChainedWorkflow={removeChainedWorkflow}
      />
      <RightHandle />
    </Box>
  );
};

export default memo(WorkflowNode);
