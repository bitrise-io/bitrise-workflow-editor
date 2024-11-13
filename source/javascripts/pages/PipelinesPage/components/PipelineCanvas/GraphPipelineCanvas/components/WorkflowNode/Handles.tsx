import { CSSProperties, useRef } from 'react';
import {
  Edge,
  Handle,
  HandleProps,
  Node,
  Position,
  useConnection,
  useEdges,
  useNodeId,
  useReactFlow,
} from '@xyflow/react';
import { Box, BoxProps } from '@bitrise/bitkit';
import { useHover } from 'usehooks-ts';
import { Icon, IconProps } from '@chakra-ui/react';
import useFeatureFlag from '@/hooks/useFeatureFlag';
import { PipelineWorkflow } from '@/core/models/Workflow';
import { PipelineConfigDialogType, usePipelinesPageStore } from '@/pages/PipelinesPage/PipelinesPage.store';
import usePipelineSelector from '@/pages/PipelinesPage/hooks/usePipelineSelector';
import { GRAPH_EDGE_TYPE, PLACEHOLDER_NODE_TYPE, WORKFLOW_NODE_HEIGHT } from '../../GraphPipelineCanvas.const';

const defaultHandleStyle = (overrides?: CSSProperties): CSSProperties => ({
  width: 12,
  height: 12,
  border: 'none',
  borderRadius: 12,
  pointerEvents: 'none',
  top: WORKFLOW_NODE_HEIGHT / 2,
  transform: `translate(0, -50%)`,
  background: 'var(--colors-background-active)',
  ...overrides,
});

const defaultHandleButtonStyle: CSSProperties = {
  width: 16,
  height: 16,
  border: 'none',
  cursor: 'pointer',
  transform: `translate(0, -50%)`,
  backgroundColor: 'transparent',
};

const createPlaceholderNode = (dependsOn?: string | null): Node<PipelineWorkflow> => ({
  id: PLACEHOLDER_NODE_TYPE,
  type: PLACEHOLDER_NODE_TYPE,
  position: { x: -9999, y: 0 },
  data: { id: PLACEHOLDER_NODE_TYPE, dependsOn: dependsOn ? [dependsOn] : [] },
});

const createPlaceholderEdge = (source?: string | null): Edge => ({
  id: `${source}->${PLACEHOLDER_NODE_TYPE}`,
  type: GRAPH_EDGE_TYPE,
  source: source || '',
  target: PLACEHOLDER_NODE_TYPE,
  animated: true,
});

const HandleIcon = ({ isDragging, ...props }: IconProps & { isDragging: boolean }) => {
  const hoverStyle = {
    fill: 'var(--colors-button-primary-bg-hover)',
    outline: '2px solid',
    outlineColor: 'sys/interactive/moderate',
  };

  return (
    <Icon
      {...props}
      display="block"
      viewBox="0 0 16 17"
      borderRadius="16px"
      _groupHover={hoverStyle}
      {...(isDragging ? hoverStyle : { fill: 'var(--colors-icon-interactive)' })}
    >
      <rect y="0.5" width="16" height="16" rx="8" fill="inherit" />
      <path d="M8 4.5V12.5M4 8.5H12" stroke="white" strokeWidth="2" />
    </Icon>
  );
};

const HandleButton = ({ style, position, isDragging, ...props }: HandleProps & { isDragging: boolean }) => {
  const id = useNodeId();
  const { openDialog } = usePipelinesPageStore();
  const { selectedPipeline } = usePipelineSelector();
  const { addNodes, deleteElements, addEdges, updateNodeData } = useReactFlow();

  const onPointerEnter = () => {
    addNodes(createPlaceholderNode(id));
    addEdges(createPlaceholderEdge(id));
    updateNodeData(id || '', (data) => ({ ...data, fixed: true }));
  };

  const onPointerLeave = () => {
    deleteElements({
      nodes: [{ id: PLACEHOLDER_NODE_TYPE }],
      edges: [{ id: `${id}->${PLACEHOLDER_NODE_TYPE}` }],
    });
    updateNodeData(id || '', (data) => ({ ...data, fixed: false }));
  };

  return (
    <Box
      width={16}
      height={16}
      style={style}
      role="button"
      position="absolute"
      className="group nopan"
      transform="translate(0, -50%)"
      top={WORKFLOW_NODE_HEIGHT / 2}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onClick={openDialog(PipelineConfigDialogType.WORKFLOW_SELECTOR, selectedPipeline, id ?? '')}
    >
      <HandleIcon isDragging={isDragging} />
      <Handle {...props} position={position} style={{ ...defaultHandleButtonStyle }} />
    </Box>
  );
};

export const LeftHandle = (props: BoxProps) => {
  const id = useNodeId();
  const edges = useEdges();
  const { inProgress, toHandle, isValid } = useConnection();

  const isHidden = !edges.some(({ target }) => target === id) && !inProgress;
  const isConnectionSnapped = isValid && inProgress && toHandle?.nodeId === id;

  const style = defaultHandleStyle(
    isConnectionSnapped ? { left: 8, background: 'var(--colors-border-selected)' } : { left: 8 },
  );

  return (
    <Box
      w={16}
      {...props}
      cursor="grab"
      overflow="hidden"
      position="relative"
      visibility={isHidden ? 'hidden' : undefined}
    >
      <Handle type="target" position={Position.Left} style={style} />
    </Box>
  );
};

export const RightHandle = (props: BoxProps) => {
  const id = useNodeId();
  const ref = useRef(null);
  const hover = useHover(ref);
  const fromHandle = useConnection((s) => s.fromHandle);
  const isGraphPipelinesEnabled = useFeatureFlag('enable-dag-pipelines');

  const isDragging = fromHandle?.position === Position.Right && fromHandle?.nodeId === id;
  const isInButtonState = isGraphPipelinesEnabled && (isDragging || (hover && !fromHandle));

  return (
    <Box
      w={16}
      ref={ref}
      {...props}
      cursor="grab"
      position="relative"
      overflow={isInButtonState ? 'visible' : 'hidden'}
    >
      {isInButtonState ? (
        <HandleButton type="source" position={Position.Right} style={{ right: 6 }} isDragging={isDragging} />
      ) : (
        <Handle type="source" position={Position.Right} style={defaultHandleStyle({ right: 8 })} />
      )}
    </Box>
  );
};
