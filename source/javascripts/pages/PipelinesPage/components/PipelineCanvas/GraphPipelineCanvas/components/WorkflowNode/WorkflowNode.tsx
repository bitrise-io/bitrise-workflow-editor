import { memo, useCallback, useRef } from 'react';
import { Box } from '@bitrise/bitkit';
import { useResizeObserver } from 'usehooks-ts';
import { Node, NodeProps, useReactFlow } from '@xyflow/react';
import { PipelineWorkflow } from '@/core/models/Workflow';
import { WorkflowCard } from '@/components/unified-editor';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { WORKFLOW_NODE_WIDTH } from '../../GraphPipelineCanvas.const';
import { PipelineConfigDialogType, usePipelinesPageStore } from '../../../../../PipelinesPage.store';
import { LeftHandle, RightHandle } from './Handles';

type Props = NodeProps<Node<WorkflowNodeDataType>>;
type WorkflowNodeDataType = PipelineWorkflow & { pipelineId: string };

const WorkflowNode = ({ data: { pipelineId }, id, zIndex, selected }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const { openDialog } = usePipelinesPageStore();
  const { updateNode, deleteElements } = useReactFlow();
  const { removeChainedWorkflow } = useBitriseYmlStore((s) => ({
    removeChainedWorkflow: s.removeChainedWorkflow,
  }));
  const openEditWorkflowDialog = useCallback(
    (workflowId: string) => openDialog(PipelineConfigDialogType.WORKFLOW_CONFIG, pipelineId, workflowId)(),
    [openDialog, pipelineId],
  );

  const hoverStyle = {
    outline: '2px solid',
    outlineColor: 'var(--colors-border-selected)',
  };

  useResizeObserver({
    ref,
    onResize: (size) => updateNode(id, { height: size.height }),
  });

  return (
    <Box ref={ref} display="flex" zIndex={zIndex} alignItems="stretch" w={WORKFLOW_NODE_WIDTH}>
      <LeftHandle />
      <WorkflowCard
        id={id}
        isCollapsable
        onEditWorkflow={openEditWorkflowDialog}
        onRemoveWorkflow={(wfId) => deleteElements({ nodes: [{ id: wfId }] })}
        onRemoveChainedWorkflow={removeChainedWorkflow}
        containerProps={{ style: selected ? hoverStyle : {} }}
      />
      <RightHandle />
    </Box>
  );
};

export default memo(WorkflowNode);
