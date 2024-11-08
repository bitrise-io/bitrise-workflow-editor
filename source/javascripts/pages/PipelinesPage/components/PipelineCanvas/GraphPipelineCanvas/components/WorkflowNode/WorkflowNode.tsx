import { memo, useRef } from 'react';
import { Box } from '@bitrise/bitkit';
import { useResizeObserver } from 'usehooks-ts';
import { Node, NodeProps, useReactFlow } from '@xyflow/react';
import { PipelineWorkflow } from '@/core/models/Workflow';
import { WorkflowCard } from '@/components/unified-editor';
import { WORKFLOW_NODE_WIDTH } from '../../GraphPipelineCanvas.const';
import { PipelineConfigDialogType, usePipelinesPageStore } from '../../../../../PipelinesPage.store';
import { LeftHandle, RightHandle } from './Handles';

type Props = NodeProps<Node<WorkflowNodeDataType>>;
type WorkflowNodeDataType = PipelineWorkflow & { pipelineId: string };

const WorkflowNode = ({ data: { pipelineId }, id, zIndex }: Props) => {
  const { updateNode } = useReactFlow();
  const ref = useRef<HTMLDivElement>(null);

  useResizeObserver({
    ref,
    onResize: (size) => updateNode(id, { height: size.height }),
  });

  const { openDialog } = usePipelinesPageStore();

  return (
    <Box ref={ref} display="flex" zIndex={zIndex} alignItems="stretch" w={WORKFLOW_NODE_WIDTH}>
      <LeftHandle />
      <WorkflowCard
        id={id}
        isCollapsable
        workflowActions={{
          onEditWorkflowClick: openDialog(PipelineConfigDialogType.WORKFLOW_CONFIG, pipelineId, id),
        }}
      />
      <RightHandle />
    </Box>
  );
};

export default memo(WorkflowNode);
