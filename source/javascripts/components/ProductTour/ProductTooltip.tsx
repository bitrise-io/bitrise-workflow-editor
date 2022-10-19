import { Text, Button, IconButton, Box, Icon, Link } from "@bitrise/bitkit";

import "./ProductTooltip.scss";

import { Tips } from "./types";

interface ProductTooltipProps {
	tip: Tips;
	rect: DOMRect | null;
	onClose: () => void;
	onButtonClick: (data?: string) => void;
	onNext: () => void;
	onPrev: () => void;
	onRestart: () => void;
	finished: boolean;
	selectedIndex: number;
	total: number;
}

export const ProductTooltip = ({
	tip,
	finished,
	selectedIndex,
	total,
	onNext,
	onPrev,
	onRestart,
	rect,
	onClose,
	onButtonClick
}: ProductTooltipProps): JSX.Element | null => {
	if (!tip) {
		return null;
	}

	const onGotIt = (): void => {
		onButtonClick("got it");
		onClose();
	};

	return (
		<Box
			left={tip.position === "right" ? rect!.x + rect!.width + 37: rect!.width/2 - 210}
			top={tip.position === "right" ? rect!.bottom/2  - 22: (rect?.y ?? 0) + (rect?.height ?? 0) + 40}
			className="product-tooltip"
			position="relative"
		>
			<Box display="flex" flexGrow="1">
				{ tip.position === "right" ? 
					<div className="arrow-left" /> : 
					<div className="arrow-up" /> }
				<Box display="flex" flexDirection="column" flex="1 0 0" gap="8px">
					<Text size="4" fontWeight="bold">
						{tip.title}
					</Text>
					<Text maxWidth="400px" paddingBottom="20">
						{tip.description}
						{tip.link && (
							<Link
								onClick={() => {
									onButtonClick("learn more");
								}}
								color="grape-3"
								isUnderlined
								target="_blank"
								rel="noreferrer"
								href={tip.link}
								style={{ display: "inline-block", marginLeft: "4px" }}
							>
								Learn more
							</Link>
						)}
					</Text>
				</Box>
				{!finished && (
					<Box>
						<Button onClick={onClose} size="small" variant="tertiary" padding="0">
							<Icon name="CloseSmall" textColor="grape-5" />
						</Button>
					</Box>
				)}
			</Box>

			<Box display="flex" flexDirection="row" className="product-tooltip__footer">
				<Box
					display="flex"
					borderRadius="4"
					flexDirection="row"
					alignItems="center"
					backgroundColor="neutral.95"
					paddingX="12"
					justifyContent="center"
				>
					<Text size="2">{selectedIndex !== undefined && `${selectedIndex + 1} / ${total}`}</Text>
				</Box>

				{finished ? (
					<Box>
						<Button variant="tertiary" size="small" color="purple.50" onClick={onRestart}>
						Start again
						</Button>
						<Button variant="primary" size="small" onClick={onGotIt}>
							Got it
						</Button>
					</Box>
				) : (
					<Box className="product-tooltip__navigation">
						<IconButton iconName="ChevronLeft" aria-label="Previous" size="small" variant="secondary" onClick={onPrev}/>
						<IconButton iconName="ChevronRight" aria-label="Next" size="small" variant="secondary" onClick={onNext}/>
					</Box>
				)}
			</Box>
		</Box>
	);
};
