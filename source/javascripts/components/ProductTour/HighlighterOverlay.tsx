import { Portal } from "./Portal";

import { Box } from "@bitrise/bitkit";

interface HighlighterOverlayProps {
	clipPath: string;
	rect: DOMRect;
	children: JSX.Element;
	isOpen: boolean;
}

export const HighlighterOverlay = ({
	clipPath,
	children,
	isOpen,
	}: HighlighterOverlayProps): JSX.Element | null => {
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
				<>
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
					{children}
				</>
			</Box>
        
		</Portal>
	);
};
