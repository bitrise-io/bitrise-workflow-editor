import { memo, useRef } from 'react';
import { Box } from '@bitrise/bitkit';
import { useResizeObserver } from 'usehooks-ts';
import { Node, NodeProps, useReactFlow } from '@xyflow/react';
import { PipelineWorkflow } from '@/core/models/Workflow';
import { WorkflowCard } from '@/components/unified-editor';
import { WORKFLOW_NODE_WIDTH } from '../../GraphPipelineCanvas.const';
import { LeftHandle, RightHandle } from './Handles';

type Props = NodeProps<Node<PipelineWorkflow>>;

const WorkflowNode = ({ id, zIndex }: Props) => {
  const { updateNode } = useReactFlow();
  const ref = useRef<HTMLDivElement>(null);

  useResizeObserver({ ref, onResize: (size) => updateNode(id, { height: size.height }) });

  return (
    <Box
      ref={ref}
      display="flex"
      zIndex={zIndex}
      alignItems="stretch"
      minW={WORKFLOW_NODE_WIDTH}
      maxW={WORKFLOW_NODE_WIDTH}
    >
      <LeftHandle />
      <WorkflowCard id={id} isCollapsable />
      <RightHandle />
    </Box>
  );
};

export default memo(WorkflowNode);
