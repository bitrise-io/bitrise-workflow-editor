import { BaseEdge, EdgeProps, getSmoothStepPath } from '@xyflow/react';

type Props = EdgeProps;

const GraphEdge = (props: Props) => {
  const { sourceX, targetX, style } = props;

  const [edgePath] = getSmoothStepPath({
    ...props,
    offset: 0,
    borderRadius: 12,
    targetX: targetX + 8,
    sourceX: sourceX - 8,
    centerX: targetX - 18,
  });

  return (
    <BaseEdge
      {...props}
      path={edgePath}
      style={{
        ...style,
        strokeWidth: 2,
        stroke: 'var(--colors-border-minimal)',
      }}
    />
  );
};

export default GraphEdge;
