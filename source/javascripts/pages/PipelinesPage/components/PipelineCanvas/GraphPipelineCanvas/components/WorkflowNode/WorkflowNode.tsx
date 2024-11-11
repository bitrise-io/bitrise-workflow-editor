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

const WorkflowNode = ({ data: { pipelineId }, id, zIndex }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const openDialog = usePipelinesPageStore((s) => s.openDialog);
  const removeWorkflowFromPipeline = useBitriseYmlStore((s) => s.removeWorkflowFromPipeline);
  const { updateNode, setNodes, deleteElements } = useReactFlow<Node<WorkflowNodeDataType>>();

  const handleRemoveWorkflow = useCallback(() => {
    removeWorkflowFromPipeline(pipelineId, id);
    deleteElements({ nodes: [{ id }] });
    setNodes((nodes) => {
      return nodes.map((node) => {
        return {
          ...node,
          data: {
            ...node.data,
            dependsOn: node.data.dependsOn.filter((dep) => dep !== id),
          },
        };
      });
    });
  }, [id, pipelineId, deleteElements, removeWorkflowFromPipeline, setNodes]);

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
        onEditWorkflow={openDialog(PipelineConfigDialogType.WORKFLOW_CONFIG, pipelineId, id)}
        onRemoveWorkflow={handleRemoveWorkflow}
      />
      <RightHandle />
    </Box>
  );
};

export default memo(WorkflowNode);
