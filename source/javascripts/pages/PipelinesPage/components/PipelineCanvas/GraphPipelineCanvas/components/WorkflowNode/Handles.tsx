import { CSSProperties } from 'react';
import { Handle, HandleProps, Position, useEdges, useNodeId } from '@xyflow/react';
import { forwardRef, Icon, IconProps } from '@chakra-ui/react';

type CustomHandleProps = Omit<HandleProps, 'type' | 'position'> & {
  height?: number;
};

const handleStyle = (style?: CSSProperties): CSSProperties => {
  return {
    width: 16,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    overflow: 'visible',
    alignItems: 'center',
    background: 'rgba(255, 0, 0, 0.0)',
    borderRadius: 0,
    ...style,
  };
};

const HandleButton = forwardRef((props: IconProps, ref) => {
  return (
    <Icon ref={ref} role="button" position="relative" fill="icon/interactive" viewBox="0 0 16 17" {...props}>
      <rect y="0.5" width="16" height="16" rx="8" fill="inherit" />
      <path d="M8 4.5V12.5M4 8.5H12" stroke="white" strokeWidth="2" />
    </Icon>
  );
});

export const LeftHandle = ({ height, ...props }: CustomHandleProps) => {
  const id = useNodeId();
  const edges = useEdges();
  const hasDependencies = edges.some(({ target }) => target === id);

  if (!hasDependencies) {
    return null;
  }

  return (
    <Handle
      {...props}
      type="target"
      className="group"
      position={Position.Left}
      style={handleStyle({ height, left: -8 })}
      onPointerDown={(e) => e.preventDefault()}
    >
      <HandleButton right={-6} />
    </Handle>
  );
};

export const RightHandle = ({ height, ...props }: CustomHandleProps) => {
  const id = useNodeId();
  const edges = useEdges();
  const hasDependants = edges.some(({ source }) => source === id);

  if (!hasDependants) {
    return null;
  }

  return (
    <Handle
      {...props}
      type="source"
      className="group"
      position={Position.Right}
      style={handleStyle({ height, right: -8 })}
      onPointerDown={(e) => e.preventDefault()}
    >
      <HandleButton left={-6} />
    </Handle>
  );
};
