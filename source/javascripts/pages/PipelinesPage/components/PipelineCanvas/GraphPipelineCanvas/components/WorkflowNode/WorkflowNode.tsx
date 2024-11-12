import { memo, useCallback, useRef } from 'react';
import { Box } from '@bitrise/bitkit';
import { useResizeObserver } from 'usehooks-ts';
import { Node, NodeProps, useReactFlow } from '@xyflow/react';
import { PipelineWorkflow } from '@/core/models/Workflow';
import { WorkflowCard } from '@/components/unified-editor';
import useFeatureFlag from '@/hooks/useFeatureFlag';
import { WORKFLOW_NODE_WIDTH } from '../../GraphPipelineCanvas.const';
import { PipelineConfigDialogType, usePipelinesPageStore } from '../../../../../PipelinesPage.store';
import { LeftHandle, RightHandle } from './Handles';

type Props = NodeProps<Node<WorkflowNodeDataType>>;
export type WorkflowNodeDataType = PipelineWorkflow & { pipelineId?: string };

const WorkflowNode = ({ data: { pipelineId }, id, zIndex, selected }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const { openDialog } = usePipelinesPageStore();
  const isGraphPipelinesEnabled = useFeatureFlag('enable-dag-pipelines');

  const { updateNode, deleteElements } = useReactFlow<Node<WorkflowNodeDataType>>();
  /* NOTE: will be included later
  const { removeChainedWorkflow } = useBitriseYmlStore((s) => ({
    removeChainedWorkflow: s.removeChainedWorkflow,
  }));
  */
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
        onEditWorkflow={isGraphPipelinesEnabled ? openEditWorkflowDialog : undefined}
        // onEditChainedWorkflow={openEditWorkflowDialog}
        onRemoveWorkflow={isGraphPipelinesEnabled ? (wfId) => deleteElements({ nodes: [{ id: wfId }] }) : undefined}
        // onRemoveChainedWorkflow={removeChainedWorkflow}
        containerProps={{ style: selected ? hoverStyle : {} }}
      />
      <RightHandle />
    </Box>
  );
};

export default memo(WorkflowNode);
