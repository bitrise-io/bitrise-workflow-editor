import { CSSProperties, useEffect, useRef } from 'react';
import { Box } from '@bitrise/bitkit';
import { useResizeObserver } from 'usehooks-ts';
import { Handle, Node, NodeProps, Position, useEdges, useReactFlow } from 'reactflow';
import { PipelineWorkflow } from '@/core/models/Workflow';
import { WorkflowCard } from '@/components/unified-editor';
import { WORKFLOW_NODE_HEIGHT, WORKFLOW_NODE_WIDTH } from '../GraphPipelineCanvas.const';
import autoLayoutingGraphNodes from '../utils/autoLayoutingGraphNodes';

type Props = NodeProps<PipelineWorkflow>;

const handleStyle: CSSProperties = {
  width: 12,
  height: 12,
  border: 'none',
  top: WORKFLOW_NODE_HEIGHT / 2,
  background: 'var(--colors-background-active)',
};

function updateNodeHeight(id: string, height?: number) {
  return (nodes: Node<PipelineWorkflow>[]) => {
    return autoLayoutingGraphNodes(
      nodes.map((n) => {
        if (n.id !== id) {
          return n;
        }

        return { ...n, height };
      }),
    );
  };
}

const WorkflowNode = ({ id, isConnectable, zIndex }: Props) => {
  const edges = useEdges();
  const ref = useRef<HTMLDivElement>(null);
  const { height } = useResizeObserver({ ref });
  const { setNodes } = useReactFlow<PipelineWorkflow>();
  const hasDependants = edges.some(({ source }) => source === id);
  const hasDependencies = edges.some(({ target }) => target === id);

  useEffect(() => {
    setNodes(updateNodeHeight(id, height));
  }, [height, setNodes, id]);

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
        <WorkflowCard id={id} isCollapsable />
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
