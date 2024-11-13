import { memo, useMemo, useRef } from 'react';
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

const hoverStyle = {
  outline: '2px solid',
  outlineColor: 'border/selected',
  outlineOffset: '-2px',
};

const defaultStyle = {
  border: '1px solid',
  borderColor: 'border/regular',
};

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

  const containerProps = useMemo(() => (selected ? hoverStyle : defaultStyle), [selected]);

  return (
    <Box ref={ref} display="flex" zIndex={zIndex} alignItems="stretch" w={WORKFLOW_NODE_WIDTH}>
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
