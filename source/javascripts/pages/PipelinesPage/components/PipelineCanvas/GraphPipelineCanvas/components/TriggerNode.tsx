import { BitkitTooltip, IconTrigger } from '@bitrise/bitkit-v2';
import { chakra } from '@chakra-ui/react/styled-system';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { useEffect } from 'react';

import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import usePipelineSelector from '@/pages/PipelinesPage/hooks/usePipelineSelector';
import { PipelinesPageDialogType, usePipelinesPageStore } from '@/pages/PipelinesPage/PipelinesPage.store';

import { TRIGGER_NODE_ID, TRIGGER_NODE_SIZE } from '../GraphPipelineCanvas.const';
import { GraphPipelineEdgeType, GraphPipelineNodeType } from '../GraphPipelineCanvas.types';

// Where a run of the Pipeline starts: the triggers, ahead of the Workflows that run first. Its
// resting, hover and selected looks follow the Workflow nodes'.
const TriggerNode = () => {
  const { selectedPipeline } = usePipelineSelector();
  const openDialog = usePipelinesPageStore((s) => s.openDialog);
  // "Selected" while the Pipeline's drawer is open on its Triggers tab, as a Workflow node is while
  // its own drawer is open.
  const isSelected = usePipelinesPageStore(
    (s) => s.openedDialogType === PipelinesPageDialogType.PIPELINE_CONFIG && s.pipelineConfigTab === 'triggers',
  );
  const hasTriggers = useBitriseYmlStore((s) => Boolean(s.yml.pipelines?.[selectedPipeline]?.triggers));
  const { getEdges, updateEdgeData } = useReactFlow<GraphPipelineNodeType, GraphPipelineEdgeType>();
  const label = hasTriggers ? 'Edit triggers' : 'Set up triggers';

  // Its edges light up with it, like a selected Workflow's.
  useEffect(() => {
    getEdges()
      .filter((edge) => edge.source === TRIGGER_NODE_ID)
      .forEach((edge) => updateEdgeData(edge.id, { highlighted: isSelected }));
  }, [getEdges, updateEdgeData, isSelected]);

  return (
    <>
      <BitkitTooltip text={label}>
        <chakra.button
          type="button"
          className="nodrag nopan"
          aria-label={label}
          aria-pressed={isSelected}
          display="flex"
          alignItems="center"
          justifyContent="center"
          width="32"
          height="32"
          borderRadius="16"
          border="1px solid"
          borderColor="border/regular"
          boxShadow="elevation/sm"
          background="background/primary"
          color="icon/secondary"
          cursor="pointer"
          _hover={{ borderColor: 'border/hover', color: 'icon/primary' }}
          {...(isSelected && {
            outline: '2px solid',
            outlineColor: 'border/selected',
            outlineOffset: '-2px',
            color: 'icon/primary',
          })}
          onClick={openDialog({
            type: PipelinesPageDialogType.PIPELINE_CONFIG,
            pipelineId: selectedPipeline,
            pipelineConfigTab: 'triggers',
          })}
        >
          <IconTrigger size="16" />
        </chakra.button>
      </BitkitTooltip>
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={false}
        // A zero-size point on the circle's edge, so its edges start right at the circle. React Flow's
        // default 6px handle sits half outside the node, leaving a gap before the line.
        style={{
          top: TRIGGER_NODE_SIZE / 2,
          right: 0,
          width: 0,
          height: 0,
          minWidth: 0,
          minHeight: 0,
          border: 'none',
          transform: 'translate(0, -50%)',
          opacity: 0,
          pointerEvents: 'none',
        }}
      />
    </>
  );
};

export default TriggerNode;
