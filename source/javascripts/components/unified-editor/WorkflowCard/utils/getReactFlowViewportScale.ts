export default function getRectFlowViewportScale() {
  const viewport = document.querySelector('.xyflow__viewport');

  if (!viewport) {
    return 1;
  }

  const [, scale] = viewport.computedStyleMap().get('transform') as [CSSTranslate, CSSScale];
  const scaleValue = scale.x.valueOf();

  if (typeof scaleValue === 'number') {
    return scaleValue;
  }

  return (scaleValue as CSSUnitValue).value;
}
