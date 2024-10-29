import { CSSProperties, useRef } from 'react';
import dagre from '@dagrejs/dagre';
import { Box } from '@bitrise/bitkit';
import { useResizeObserver } from 'usehooks-ts';
import { Handle, NodeProps, Position, useEdges, useNodes, useReactFlow } from 'reactflow';
import { PipelineWorkflow } from '@/core/models/Workflow';
import { WorkflowCard } from '@/components/unified-editor';
import {
  CANVAS_PADDING,
  TOOLBAR_CONTAINER_HEIGHT,
  WORKFLOW_NODE_GAP_X,
  WORKFLOW_NODE_GAP_Y,
  WORKFLOW_NODE_HEIGHT,
  WORKFLOW_NODE_WIDTH,
} from '../GraphPipelineCanvas.const';

type Props = NodeProps<PipelineWorkflow>;

const handleStyle: CSSProperties = {
  width: 12,
  height: 12,
  border: 'none',
  top: WORKFLOW_NODE_HEIGHT / 2,
  background: 'var(--colors-background-active)',
};

const WorkflowNode = ({ data: workflow, isConnectable, zIndex }: Props) => {
  const edges = useEdges();
  const ref = useRef<HTMLDivElement>(null);
  const nodes = useNodes<PipelineWorkflow>();
  const { setNodes } = useReactFlow<PipelineWorkflow>();
  const hasDependants = edges.some(({ source }) => source === workflow.id);
  const hasDependencies = edges.some(({ target }) => target === workflow.id);

  useResizeObserver({
    ref,
    onResize: ({ height }) => {
      const graph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

      graph.setGraph({
        align: 'DL',
        rankdir: 'LR',
        marginx: CANVAS_PADDING - 160,
        marginy: CANVAS_PADDING + TOOLBAR_CONTAINER_HEIGHT,
        ranksep: WORKFLOW_NODE_GAP_X,
        nodesep: WORKFLOW_NODE_GAP_Y,
        edgesep: WORKFLOW_NODE_HEIGHT + WORKFLOW_NODE_GAP_Y,
      });

      nodes.forEach((node) => {
        if (node.data.id === workflow.id) {
          graph.setNode(node.data.id, { width: WORKFLOW_NODE_WIDTH, height });
        } else {
          graph.setNode(node.data.id, { width: WORKFLOW_NODE_WIDTH, height: WORKFLOW_NODE_HEIGHT });
        }
        node.data.dependsOn.forEach((source) => graph.setEdge(source, node.id));
      });

      dagre.layout(graph);

      setNodes((prev) =>
        prev.map((n) => {
          const { x, y, height: h } = graph.node(n.id);
          return { ...n, position: { x, y: y - h / 2 } };
        }),
      );
    },
  });

  return (
    <>
      <Handle
        type="target"
        hidden={!hasDependencies}
        position={Position.Left}
        isConnectable={isConnectable}
        style={{ left: -6, zIndex: zIndex - 1, ...handleStyle }}
      />
      <Box ref={ref} zIndex={zIndex} width={WORKFLOW_NODE_WIDTH} position="relative">
        <WorkflowCard id={workflow.id} isCollapsable />
      </Box>
      <Handle
        type="source"
        hidden={!hasDependants}
        position={Position.Right}
        isConnectable={isConnectable}
        style={{ right: -6, zIndex: zIndex - 1, ...handleStyle }}
      />
    </>
  );
};

export default WorkflowNode;
