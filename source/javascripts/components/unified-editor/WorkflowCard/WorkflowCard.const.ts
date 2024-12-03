import { getScrollableAncestors, MeasuringConfiguration } from '@dnd-kit/core';

export const dndKitMeasuring: MeasuringConfiguration = {
  draggable: {
    measure: (elem) => {
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
