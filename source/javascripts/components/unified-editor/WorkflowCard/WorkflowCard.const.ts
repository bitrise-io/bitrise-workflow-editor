import { MeasuringConfiguration } from '@dnd-kit/core';

export const dndKitMeasuring: MeasuringConfiguration = {
  draggable: {
    measure: (elem) => {
      return {
        top: elem.offsetTop,
        right: elem.offsetLeft + elem.offsetWidth,
        bottom: elem.offsetTop + elem.offsetHeight,
        left: elem.offsetLeft,
        width: elem.offsetWidth,
        height: elem.offsetHeight,
      };
    },
  },
};
