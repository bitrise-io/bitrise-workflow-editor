import { useEffect, useRef } from "react";

export const useWaitForElements = (ids: string[], onFound: (ids: HTMLElement[]) => void) => {
	const timeoutRef = useRef<NodeJS.Timeout>();
	useEffect(() => {
		const checkIfReady = () => {
			const found = ids.map(id => document.getElementById(id)).filter(Boolean);
			if (found.length === ids.length) {
				clearTimeout(timeoutRef.current);
				onFound(found as HTMLElement[]);
				return;
			}
			timeoutRef.current = setTimeout(checkIfReady, 250);
		};

		checkIfReady();

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [ids, onFound]);
};
