import { CSSProperties } from 'react';
import { BaseEdge, ConnectionLineComponentProps, EdgeProps, getSmoothStepPath, Position } from '@xyflow/react';

const edgeStyle = (style?: CSSProperties) => {
  return { strokeWidth: 2, ...style };
};

const GraphEdge = (props: EdgeProps) => {
  const { style, selected } = props;

  const [path] = getSmoothStepPath({ ...props, offset: 0, borderRadius: 12 });

  return (
    <BaseEdge
      {...props}
      path={path}
      style={edgeStyle({
        ...style,
        stroke: selected ? 'var(--colors-border-selected)' : 'var(--colors-border-minimal)',
      })}
    />
  );
};

export const ConnectionGraphEdge = (props: ConnectionLineComponentProps) => {
  const { fromX, fromY, toX, toY, connectionLineStyle, fromPosition, toPosition, connectionStatus } = props;

  const targetXOffset = toPosition === Position.Left ? -8 : 8;
  const sourceXOffset = fromPosition === Position.Left ? -8 : 8;

  const stroke = ['valid', null].includes(connectionStatus)
    ? 'var(--colors-icon-interactive)'
    : 'var(--colors-icon-negative)';

  const [path] = getSmoothStepPath({
    offset: 0,
    targetY: toY,
    targetX: toX + targetXOffset,
    sourceY: fromY,
    sourceX: fromX + sourceXOffset,
    borderRadius: 12,
    sourcePosition: fromPosition,
    targetPosition: toPosition,
  });

  return <BaseEdge path={path} style={edgeStyle({ ...connectionLineStyle, stroke })} />;
};

export default GraphEdge;
