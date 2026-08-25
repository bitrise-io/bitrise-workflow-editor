import { getScrollableAncestors, MeasuringConfiguration } from '@dnd-kit/core';

/**
 * A card header click that lands on a nested control (chevron, drag handle, action buttons) belongs to that
 * control, not to the card. One `closest()` guard in the header handler covers them all, since they render
 * real `<button>`s.
 */
export const INTERACTIVE_CARD_HEADER_SELECTOR = 'button, a, input, select, textarea, [role="button"]';

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
