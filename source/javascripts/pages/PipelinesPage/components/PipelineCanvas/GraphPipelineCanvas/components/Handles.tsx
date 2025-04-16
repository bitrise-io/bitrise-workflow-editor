import { Box, BoxProps } from '@bitrise/bitkit';
import { Icon, IconProps } from '@chakra-ui/react';
import { Handle, HandleProps, Position, useConnection, useEdges, useNodeId, useReactFlow } from '@xyflow/react';
import { CSSProperties, useRef } from 'react';
import { useHover } from 'usehooks-ts';

import usePipelineSelector from '../../../../hooks/usePipelineSelector';
import { PipelinesPageDialogType, usePipelinesPageStore } from '../../../../PipelinesPage.store';
import { PLACEHOLDER_NODE_ID, WORKFLOW_NODE_HEIGHT } from '../GraphPipelineCanvas.const';
import createPlaceholderEdge from '../utils/createPlaceholderEdge';
import createPlaceholderNode from '../utils/createPlaceholderNode';

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
  const openDialog = usePipelinesPageStore((s) => s.openDialog);
  const { selectedPipeline } = usePipelineSelector();
  const { updateNodeData, addNodes, addEdges, deleteElements } = useReactFlow();

  const onPointerEnter = () => {
    if (id) {
      addNodes(createPlaceholderNode(id));
      addEdges(createPlaceholderEdge(id));
      updateNodeData(id, (data) => ({ ...data, fixed: true }));
    }
  };

  const onPointerLeave = () => {
    if (id) {
      deleteElements({
        nodes: [{ id: PLACEHOLDER_NODE_ID }],
        edges: [{ id: `${id}->${PLACEHOLDER_NODE_ID}` }],
      });
      updateNodeData(id, (data) => ({ ...data, fixed: false }));
    }
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
      onClick={openDialog({
        type: PipelinesPageDialogType.WORKFLOW_SELECTOR,
        pipelineId: selectedPipeline,
        workflowId: id ?? '',
      })}
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
  const isSelected = edges.some(({ target, selected }) => target === id && selected);
  const isHighlighted = edges.some(({ target, data }) => target === id && data?.highlighted);

  const style = defaultHandleStyle({
    ...{ left: 8 },
    ...(isHighlighted ? { background: 'var(--colors-border-hover)' } : {}),
    ...(isConnectionSnapped || isSelected ? { background: 'var(--colors-border-selected)' } : {}),
  });

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
  const edges = useEdges();
  const hover = useHover(ref);
  const fromHandle = useConnection((s) => s.fromHandle);

  const isDragging = fromHandle?.position === Position.Right && fromHandle?.nodeId === id;
  const isInButtonState = isDragging || (hover && !fromHandle);
  const isSelected = edges.some(({ source, selected }) => source === id && selected);
  const isHighlighted = edges.some(({ source, data }) => source === id && data?.highlighted);

  const style = defaultHandleStyle({
    ...{ right: 8 },
    ...(isHighlighted ? { background: 'var(--colors-border-hover)' } : {}),
    ...(isSelected ? { background: 'var(--colors-border-selected)' } : {}),
  });

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
        <Handle type="source" position={Position.Right} style={style} />
      )}
    </Box>
  );
};
