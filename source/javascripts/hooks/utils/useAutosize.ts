import { ForwardedRef, useEffect, useRef } from "react";
import autosize from "autosize";

const intersectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      autosize.update(entry.target);
    }
  });
});

const useAutosize = <T extends Element>(ref: ForwardedRef<T>) => {
  const innerRef = useRef<T>(null);

  useEffect(() => {
    if (!ref) {
      return;
    }

    if (typeof ref === "function") {
      ref(innerRef.current);
    } else {
      Object.assign(ref, { current: innerRef.current });
    }
  }, [ref]);

  useEffect(() => {
    const refValue = innerRef.current;
    if (refValue) {
      autosize(refValue);
      intersectionObserver.observe(refValue);
    }

    return () => {
      if (refValue) {
        autosize.destroy(refValue);
        intersectionObserver.unobserve(refValue);
      }
    };
  }, []);

  return innerRef;
};

export default useAutosize;
