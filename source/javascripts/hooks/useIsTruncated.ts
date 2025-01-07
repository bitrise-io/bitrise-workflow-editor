import { RefObject, useEffect, useState } from 'react';

const useIsTruncated = (ref: RefObject<HTMLElement>) => {
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const refCurrent = ref.current;
    const checkTruncation = () => {
      if (refCurrent) {
        setIsTruncated(refCurrent.scrollWidth > refCurrent.clientWidth);
      }
    };

    const observer = new ResizeObserver(checkTruncation);
    if (refCurrent) {
      observer.observe(refCurrent);
    }

    // Initial check
    checkTruncation();

    return () => {
      if (refCurrent) {
        observer.unobserve(refCurrent);
      }
    };
  }, [ref]);

  return isTruncated;
};

export default useIsTruncated;
