import { memo, useEffect, useMemo, useRef } from 'react';
import { Box, CardProps } from '@bitrise/bitkit';
import { useHover, useResizeObserver } from 'usehooks-ts';
import { Node, NodeProps, useReactFlow } from '@xyflow/react';
import { PipelineWorkflow } from '@/core/models/Workflow';
import { WorkflowCard } from '@/components/unified-editor';
import useFeatureFlag from '@/hooks/useFeatureFlag';
import {
  DEFAULT_GRAPH_EDGE_ZINDEX,
  HIGHLIGHTED_GRAPH_EDGE_ZINDEX,
  SELECTED_GRAPH_EDGE_ZINDEX,
  WORKFLOW_NODE_WIDTH,
} from '../../GraphPipelineCanvas.const';
import { PipelineConfigDialogType, usePipelinesPageStore } from '../../../../../PipelinesPage.store';
import { LeftHandle, RightHandle } from './Handles';

type Props = NodeProps<Node<WorkflowNodeDataType>>;
export type WorkflowNodeDataType = PipelineWorkflow & { pipelineId?: string; highlighted?: boolean };

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

const WorkflowNode = ({ data: { pipelineId }, id, zIndex, selected }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const hovered = useHover(ref);
  const { openDialog } = usePipelinesPageStore();
  const isGraphPipelinesEnabled = useFeatureFlag('enable-dag-pipelines');
  const { updateNode, deleteElements, setEdges } = useReactFlow<Node<WorkflowNodeDataType>>();

  /* NOTE: will be included later
  const { removeChainedWorkflow } = useBitriseYmlStore((s) => ({
    removeChainedWorkflow: s.removeChainedWorkflow,
  }));
  */

  useResizeObserver({ ref, onResize: ({ height }) => updateNode(id, { height }) });

  const handleEditWorkflow = useMemo(() => {
    if (!isGraphPipelinesEnabled) {
      return undefined;
    }

    return (workflowId: string) => openDialog(PipelineConfigDialogType.WORKFLOW_CONFIG, pipelineId, workflowId)();
  }, [isGraphPipelinesEnabled, openDialog, pipelineId]);

  const handleRemoveWorkflow = useMemo(() => {
    if (!isGraphPipelinesEnabled) {
      return undefined;
    }

    return (workflowId: string) => deleteElements({ nodes: [{ id: workflowId }] });
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
          const newEdge = { ...edge, zIndex: DEFAULT_GRAPH_EDGE_ZINDEX, data: { ...edge.data, highlighted } };

          if (edge.selected) {
            newEdge.zIndex = SELECTED_GRAPH_EDGE_ZINDEX;
          } else if (highlighted) {
            newEdge.zIndex = HIGHLIGHTED_GRAPH_EDGE_ZINDEX;
          }

          return newEdge;
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
        onAddStep={}
        onSelectStep={}
        onMoveStep={}
        onUpgradeStep={}
        onCloneStep={}
        onDeleteStep={}
        onCreateWorkflow={]
        onChainWorkflow={}
        onChainChainedWorkflow={}
        onChainedWorkflowsUpdate={}
         */
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
