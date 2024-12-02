import { memo, useCallback, useMemo } from 'react';
import { CSS } from '@dnd-kit/utilities';
import { DragOverlay, DragOverlayProps, DropAnimation, Modifier } from '@dnd-kit/core';
import useReactFlowZoom from '../hooks/useReactFlowZoom';

const ScaledDragOverlay = ({ modifiers, ...props }: DragOverlayProps) => {
  const zoom = useReactFlowZoom();

  const overlayZoomModifier: Modifier = useCallback(
    ({ transform }) => {
      return { ...transform, x: transform.x / zoom, y: transform.y / zoom };
    },
    [zoom],
  );

  const dropAnimation: DropAnimation = useMemo(() => {
    return {
      keyframes: (params) => {
        const activeNodeTop = params.active.node.getBoundingClientRect().top ?? 0;
        const dragOverlayTop = params.dragOverlay.node.getBoundingClientRect().top ?? 0;
        const dragOverlayTopDelta = (activeNodeTop - dragOverlayTop) / zoom;

        const { initial, final } = params.transform;

        return [
          { transform: CSS.Transform.toString(initial) },
          { transform: CSS.Transform.toString({ ...final, x: 0, y: initial.y + dragOverlayTopDelta }) },
        ];
      },
    };
  }, [zoom]);

  const mergedModifiers = useMemo(() => {
    return [overlayZoomModifier, ...(modifiers ?? [])];
  }, [overlayZoomModifier, modifiers]);

  return <DragOverlay dropAnimation={dropAnimation} modifiers={mergedModifiers} {...props} />;
};

export default memo(ScaledDragOverlay);
