import React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Portal } from "./Portal";

import "./Highlighter.scss";

interface HighlighterProps {
	clipPath: string;
	rect: DOMRect;
	children: JSX.Element;
	isOpen: boolean;
	renderSelection?: () => JSX.Element;
}

export const useHighlighter = (selectedId: string) => {
	const ref = useRef<HTMLElement | null>(null);
	const animationFrameRef = useRef<number | undefined>();
	const [highlightedRect, setHighlightedRect] = useState<DOMRect | null>(null);

	const highlightElement = useCallback(id => {
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
		const onResize = () => {
			if (ref.current) {
				if (animationFrameRef.current) {
					cancelAnimationFrame(animationFrameRef.current);
				}

				animationFrameRef.current = requestAnimationFrame(() => {
					const rect = ref.current!.getBoundingClientRect();
					setHighlightedRect(rect);
					animationFrameRef.current = undefined;
				});
			}
		};

		window.addEventListener("resize", onResize);

		return () => {
			window.removeEventListener("resize", onResize);
		};
	}, []);

	let clipPath = "";
	if (highlightedRect) {
		const { x, y, width, height } = highlightedRect as DOMRect;
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

	return {
		clipPath,
		rect: highlightedRect,
		highlighted: !!clipPath
	};
};

export const Highlighter = ({ clipPath, rect, children, isOpen, renderSelection }: HighlighterProps) => {
	if (!isOpen || !clipPath) {
		return null;
	}

	return (
		<Portal>
			<div className="highlighter">
				<div
					className="highlighter__backdrop-mask"
					style={{
						clipPath
					}}
				/>
				{renderSelection ? (
					renderSelection()
				) : (
					<div
						className="highlighter__selection"
						style={{
							left: `${rect?.x}px`,
							top: `${rect?.y}px`,
							width: `${rect?.width}px`,
							height: `${rect?.height}px`
						}}
					/>
				)}
				{children}
			</div>
		</Portal>
	);
};
