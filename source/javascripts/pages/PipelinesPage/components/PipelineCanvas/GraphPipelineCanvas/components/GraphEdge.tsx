import { BaseEdge, EdgeProps, getSmoothStepPath } from '@xyflow/react';

type Props = EdgeProps;

const GraphEdge = (props: Props) => {
  const { targetX, selected, style } = props;
  const [edgePath] = getSmoothStepPath({ ...props, targetX, offset: 0, borderRadius: 12, centerX: targetX - 18 });

  return (
    <BaseEdge
      {...props}
      path={edgePath}
      interactionWidth={0}
      style={{
        ...style,
        strokeWidth: 2,
        pointerEvents: 'none',
        stroke: selected ? 'var(--colors-border-strong)' : 'var(--colors-border-minimal)',
      }}
    />
  );
};

export default GraphEdge;
