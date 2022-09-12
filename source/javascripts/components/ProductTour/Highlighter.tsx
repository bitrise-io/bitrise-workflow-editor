import React from "react";

import { Portal } from "./Portal";

import "./Highlighter.scss";

interface HighlighterProps {
	clipPath: string;
	rect: DOMRect;
	children: JSX.Element;
	isOpen: boolean;
	renderSelection?: () => JSX.Element;
}

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
