import { getScrollableAncestors, MeasuringConfiguration } from '@dnd-kit/core';

export const dndKitMeasuring: MeasuringConfiguration = {
  draggable: {
    measure: (elem) => {
      // The drag overlay is fixed-positioned. Inside the Pipeline canvas, React Flow's transformed viewport is its
      // frame, so offsets from the node are right. Elsewhere (the Workflows and Step bundles pages) it's placed
      // against the page, so measure against the page too; offsets would be relative to the nearest positioned
      // box, which the layout around the canvas can be.
      if (!elem.closest('.react-flow__viewport')) {
        const { top, bottom, left, right, width, height } = elem.getBoundingClientRect();
        return { top, bottom, left, right, width, height };
      }

      const scrollContainer = getScrollableAncestors(elem)[0];
      const top = elem.offsetTop - scrollContainer.scrollTop;

      return {
        top,
        bottom: top + elem.offsetHeight,
        left: elem.offsetLeft,
        right: elem.offsetLeft + elem.offsetWidth,
        width: elem.offsetWidth,
        height: elem.offsetHeight,
      };
    },
  },
};
