import { CSSProperties, useRef } from 'react';
import { Handle, HandleProps, Position, useConnection, useNodeId } from '@xyflow/react';
import { Box, BoxProps } from '@bitrise/bitkit';
import { useHover } from 'usehooks-ts';
import { Icon, IconProps } from '@chakra-ui/react';
import useFeatureFlag from '@/hooks/useFeatureFlag';
import { WORKFLOW_NODE_HEIGHT } from '../../GraphPipelineCanvas.const';

const defaultHandleStyle: CSSProperties = {
  width: 12,
  height: 12,
  border: 'none',
  borderRadius: 12,
  pointerEvents: 'none',
  top: WORKFLOW_NODE_HEIGHT / 2,
  transform: `translate(0, -50%)`,
  background: 'var(--colors-background-active)',
};

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
  return (
    <Box
      width={16}
      height={16}
      style={style}
      className="group"
      position="absolute"
      transform="translate(0, -50%)"
      top={WORKFLOW_NODE_HEIGHT / 2}
    >
      <HandleIcon isDragging={isDragging} />
      <Handle {...props} position={position} style={{ ...defaultHandleButtonStyle }} />
    </Box>
  );
};

export const LeftHandle = (props: BoxProps) => {
  const id = useNodeId();
  const ref = useRef(null);
  const hover = useHover(ref);
  const fromHandle = useConnection((s) => s.fromHandle);
  const isGraphPipelinesEnabled = useFeatureFlag('enable-dag-pipelines');

  const isDragging = fromHandle?.position === Position.Left && fromHandle?.nodeId === id;
  const isInButtonState = isGraphPipelinesEnabled && (hover || isDragging);

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
        <HandleButton type="target" position={Position.Left} style={{ left: 6 }} isDragging={isDragging} />
      ) : (
        <Handle type="target" position={Position.Left} style={{ ...defaultHandleStyle, left: 8 }} />
      )}
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
  const isInButtonState = isGraphPipelinesEnabled && (hover || isDragging);

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
        <Handle type="source" position={Position.Right} style={{ ...defaultHandleStyle, right: 8 }} />
      )}
    </Box>
  );
};
