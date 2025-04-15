import {
  BaseEdge,
  ConnectionLineComponentProps,
  EdgeProps,
  getSmoothStepPath,
  Position,
  useReactFlow,
} from '@xyflow/react';
import { CSSProperties, useEffect, useMemo } from 'react';

import {
  DEFAULT_GRAPH_EDGE_ZINDEX,
  HIGHLIGHTED_GRAPH_EDGE_ZINDEX,
  SELECTED_GRAPH_EDGE_ZINDEX,
} from '../GraphPipelineCanvas.const';

const edgeStyle = (style?: CSSProperties) => {
  return { strokeWidth: 2, ...style };
};

const GraphEdge = ({ id, style, selected, data, ...props }: EdgeProps) => {
  const { updateEdge } = useReactFlow();
  const [path] = getSmoothStepPath({ ...props, offset: 0, borderRadius: 12 });

  const zIndex = useMemo(() => {
    if (selected) return SELECTED_GRAPH_EDGE_ZINDEX;
    if (data?.highlighted) return HIGHLIGHTED_GRAPH_EDGE_ZINDEX;
    return DEFAULT_GRAPH_EDGE_ZINDEX;
  }, [data?.highlighted, selected]);

  useEffect(() => {
    updateEdge(id, { zIndex });
  }, [id, zIndex, updateEdge]);

  return (
    <BaseEdge
      // {...props} // This is causing bunch of console errors
      id={id}
      path={path}
      style={edgeStyle({
        ...style,
        ...{ stroke: 'var(--colors-border-regular)' },
        ...(data?.highlighted ? { stroke: 'var(--colors-border-hover)' } : {}),
        ...(selected ? { stroke: 'var(--colors-border-selected)' } : {}),
      })}
    />
  );
};

export const ConnectionGraphEdge = (props: ConnectionLineComponentProps) => {
  const { toX, toY, fromX, fromY, toPosition, fromPosition, connectionStatus, connectionLineStyle } = props;

  const targetXOffset = toPosition === Position.Left ? -6 : 8;
  const sourceXOffset = fromPosition === Position.Left ? -6 : 8;

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
