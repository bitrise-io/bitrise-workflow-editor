import { ClientRect, getClientRect } from '@dnd-kit/core';

const scaleInsensitiveMeasure = (node: HTMLElement): ClientRect => {
  const rect = getClientRect(node);
  rect.width = node.offsetWidth;
  return rect;
};

export default scaleInsensitiveMeasure;
