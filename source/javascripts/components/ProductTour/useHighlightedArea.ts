import { useCallback, useEffect, useRef, useState } from "react";

export const getClipPathFromRect = (highlightedRect: DOMRect | null): string => {
	let clipPath = "";
	if (highlightedRect) {
		const { x, y, width, height } = highlightedRect;
		clipPath = `polygon(0% 0%,
      0% 100%,
      ${x}px 100%,
      ${x}px ${y}px,
      ${x + width}px ${y}px,
      ${x + width}px ${y + height}px,
      ${x}px ${y + height}px,
      ${x}px 100%,
      100% 100%,
      100% 0%)`;
	}

	return clipPath;
};

export const useHighlightedArea = (selectedId: string | undefined): DOMRect | null  => {
	const ref = useRef<HTMLElement | null>(null);
	const [highlightedRect, setHighlightedRect] = useState<DOMRect | null>(null);

	const highlightElement = useCallback((id: string) => {
		const element = document.getElementById(id);
		if (element) {
			ref.current = element;
			const rect = element.getBoundingClientRect();
			setHighlightedRect(rect);
		}
	}, []);

	useEffect(() => {
		if (selectedId) {
			highlightElement(selectedId);
		}
	}, [selectedId, highlightElement]);

	useEffect(() => {
		const onResize = (): void => {
			if (ref.current) {
				const rect = ref.current!.getBoundingClientRect();
				setHighlightedRect(rect);
			}
		};

		window.addEventListener("resize", onResize);

		return () => {
			window.removeEventListener("resize", onResize);
		};
	}, []);

	return highlightedRect;
};
