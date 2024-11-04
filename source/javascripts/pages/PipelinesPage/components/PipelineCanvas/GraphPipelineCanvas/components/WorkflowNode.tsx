import { CSSProperties, useRef } from 'react';
import { Box } from '@bitrise/bitkit';
import { useResizeObserver } from 'usehooks-ts';
import { Handle, Node, NodeProps, Position, useEdges, useReactFlow } from '@xyflow/react';
import { PipelineWorkflow } from '@/core/models/Workflow';
import { WorkflowCard } from '@/components/unified-editor';
import { WORKFLOW_NODE_HEIGHT, WORKFLOW_NODE_WIDTH } from '../GraphPipelineCanvas.const';

type Props = NodeProps<Node<PipelineWorkflow>>;

const handleStyle: CSSProperties = {
  width: 12,
  height: 12,
  border: 'none',
  top: WORKFLOW_NODE_HEIGHT / 2,
  background: 'var(--colors-background-active)',
};

const WorkflowNode = ({ id, isConnectable, zIndex }: Props) => {
  const edges = useEdges();
  const { updateNode } = useReactFlow();
  const ref = useRef<HTMLDivElement>(null);

  const hasDependants = edges.some(({ source }) => source === id);
  const hasDependencies = edges.some(({ target }) => target === id);

  useResizeObserver({ ref, onResize: ({ height }) => updateNode(id, { height }, { replace: true }) });

  return (
    <>
      <Handle
        type="target"
        hidden={!hasDependencies}
        position={Position.Left}
        isConnectable={isConnectable}
        style={{ zIndex: zIndex - 1, ...handleStyle }}
      />
      <Box ref={ref} zIndex={zIndex} width={WORKFLOW_NODE_WIDTH} position="relative">
        <WorkflowCard id={id} isCollapsable />
      </Box>
      <Handle
        type="source"
        hidden={!hasDependants}
        position={Position.Right}
        isConnectable={isConnectable}
        style={{ zIndex: zIndex - 1, ...handleStyle }}
      />
    </>
  );
};

export default WorkflowNode;
