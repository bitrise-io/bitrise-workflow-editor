import { Portal } from "./Portal";

import { Box } from "@bitrise/bitkit";

interface HighlighterProps {
	clipPath: string;
	rect: DOMRect;
	children: JSX.Element;
	isOpen: boolean;
	renderSelection?: () => JSX.Element;
}

export const Highlighter = ({
	clipPath,
	rect,
	children,
	isOpen,
	renderSelection
	}: HighlighterProps): JSX.Element | null => {
	if (!isOpen || !clipPath) {
		return null;
	}

	return (
		<Portal>
			<Box
				width="100vw"
				height="100vh"
				position="fixed"
				top="0"
				left="0"
				zIndex="100"
				sx={{"& > *": {pointerEvents: "all"}}}>
				<Box
					width="100vw"
					height="100vh"
					backgroundColor="rgba(0,0,0,0.2)"
					position="absolute"
					left="0"
					top="0"
					style={{
						clipPath
					}}
				/>
				{renderSelection ? (
					renderSelection()
					) : (
						<Box
							position="absolute"
							backgroundColor= "transparent"
							borderRadius="8"
							border="10px solid white"
							boxShadow="0 0 0 3px rgba(151, 71, 255, 1)"
							zIndex="200"
							style={{
								left: `${rect?.x - 10}px`,
								top: `${rect?.y - 10}px`,
								width: `${rect?.width + 20}px`,
								height: `${rect?.height + 20}px`
							}}
				
						/>
				)}
				{children}
			</Box>
		</Portal>
		);
};
