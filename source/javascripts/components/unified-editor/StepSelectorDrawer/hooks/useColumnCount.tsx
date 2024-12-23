import { createRef, RefObject, useMemo } from 'react';
import { useResizeObserver } from 'usehooks-ts';

const MinColumnWidth = 325;

type Props = {
  ref: RefObject<HTMLElement>;
};

const useColumnCount = ({ ref }: Props): number => {
  const fallbackRef = createRef<HTMLElement>();

  // HACK: useResizeObserver has a bug https://github.com/juliencrn/usehooks-ts/pull/542
  const { width = 0 } = useResizeObserver({
    ref: ref.current ? ref : fallbackRef,
  });

  return useMemo(() => {
    if (width < MinColumnWidth) {
      return 1;
    }

    return Math.floor(width / MinColumnWidth);
  }, [width]);
};

export default useColumnCount;
