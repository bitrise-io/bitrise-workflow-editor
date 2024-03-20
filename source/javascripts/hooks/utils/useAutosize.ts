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
      // eslint-disable-next-line no-param-reassign
      ref.current = innerRef.current;
    }
  }, [ref]);

  useEffect(() => {
    const refVal = innerRef.current;
    if (refVal) {
      autosize(refVal);
      intersectionObserver.observe(refVal);
    }

    return () => {
      if (refVal) {
        autosize.destroy(refVal);
        intersectionObserver.unobserve(refVal);
      }
    };
  }, []);

  return innerRef;
};

export default useAutosize;
