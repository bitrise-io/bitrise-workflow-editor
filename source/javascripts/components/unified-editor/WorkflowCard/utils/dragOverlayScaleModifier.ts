import { Modifier } from '@dnd-kit/core';
import getReactFlowViewportScale from './getReactFlowViewportScale';

const dragOverlayScaleModifier: Modifier = ({ transform }) => {
  const scale = getReactFlowViewportScale();
  return { ...transform, scaleX: scale, scaleY: scale };
};

export default dragOverlayScaleModifier;
