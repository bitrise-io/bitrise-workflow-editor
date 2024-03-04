import autosize from "autosize";
import { ForwardedRef, useEffect, useRef } from "react";

const intersectionObserver = new IntersectionObserver((entries) => {
	for (const entry of entries) {
		if (entry.isIntersecting) {
			autosize.update(entry.target);
		}
	}
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
			ref.current = innerRef.current;
		}
	});

	useEffect(() => {
		if (innerRef.current) {
			autosize(innerRef.current);
			intersectionObserver.observe(innerRef.current);
		}

		return () => {
			if (innerRef.current) {
				autosize.destroy(innerRef.current);
				intersectionObserver.unobserve(innerRef.current);
			}
		};
	}, [innerRef.current]);

	return innerRef;
};

export default useAutosize;
