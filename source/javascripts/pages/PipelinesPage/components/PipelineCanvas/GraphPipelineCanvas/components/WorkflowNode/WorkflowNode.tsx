import { memo, useRef } from 'react';
import { Box } from '@bitrise/bitkit';
import { useResizeObserver } from 'usehooks-ts';
import { Node, NodeProps, useReactFlow } from '@xyflow/react';
import { PipelineWorkflow } from '@/core/models/Workflow';
import { WorkflowCard } from '@/components/unified-editor';
import { WORKFLOW_NODE_WIDTH } from '../../GraphPipelineCanvas.const';
import { LeftHandle, RightHandle } from './Handles';

type Props = NodeProps<Node<PipelineWorkflow>>;

const WorkflowNode = ({ id, zIndex, height }: Props) => {
  const { updateNode } = useReactFlow();
  const ref = useRef<HTMLDivElement>(null);

  useResizeObserver({ ref, onResize: (size) => updateNode(id, { height: size.height }) });

  return (
    <Box ref={ref} zIndex={zIndex} width={WORKFLOW_NODE_WIDTH}>
      <LeftHandle height={height} />
      <WorkflowCard id={id} isCollapsable />
      <RightHandle height={height} />
    </Box>
  );
};

export default memo(WorkflowNode);
