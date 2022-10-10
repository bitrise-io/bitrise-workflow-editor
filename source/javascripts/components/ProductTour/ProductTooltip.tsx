import { Text, Button, Box, Icon, Link } from "@bitrise/bitkit";

import "./ProductTooltip.scss";

import { Tips } from "./types";

interface ProductTooltipProps {
	tip: Tips;
	rect: DOMRect | null;
	onClose: () => void;
	onButtonClick: (data?: string) => void;
	onNext: () => void;
	onPrev: () => void;
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
			left={rect?.x}
			top={(rect?.y ?? 0) + (rect?.height ?? 0) + 20}
			className="product-tooltip"
		>
			<Box display="flex" flexGrow="1">
				<div className="arrow-up" style={{ left: rect!.width / 2 - 5 }} />
				<Box display="flex" flexDirection="column" flex="1 0 0" gap="8px">
					<Text size="4" fontWeight="bold">
						{tip.title}
					</Text>
					<Text maxWidth="400px">
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
						<Button onClick={onClose} variant="tertiary" style={{ padding: "0" }}>
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
					backgroundColor="neutral.95"
					paddingX="12"
					justifyContent="center"
				>
					<Text size="2">{selectedIndex !== undefined && `${selectedIndex + 1}/${total}`}</Text>
				</Box>

				{finished ? (
					<Button variant="primary" size="small" onClick={onGotIt}>
						Got it
					</Button>
				) : (
					<Box className="product-tooltip__navigation">
						<Button size="small" onClick={onPrev}>
							<Icon name="ChevronLeft" />
						</Button>
						<Button size="small" onClick={onNext}>
							<Icon name="ChevronRight" />
						</Button>
					</Box>
				)}
			</Box>
		</Box>
	);
};
