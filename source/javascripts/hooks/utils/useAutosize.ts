import autosize from "autosize";
import { RefObject, useEffect, useRef } from "react";

const intersectionObserver = new IntersectionObserver((entries) => {
	for (const entry of entries) {
		if (entry.isIntersecting) {
			autosize.update(entry.target);
		}
	}
});

const useAutosize = <T extends Element>(): RefObject<T> => {
	const ref = useRef<T>(null);

	useEffect(() => {
		if (ref.current) {
			autosize(ref.current);
			intersectionObserver.observe(ref.current);
		}

		return () => {
			if (ref.current) {
				autosize.destroy(ref.current);
				intersectionObserver.unobserve(ref.current);
			}
		};
	}, [ref.current]);

	return ref;
};

export default useAutosize;
