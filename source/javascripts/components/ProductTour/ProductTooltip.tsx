import React from "react";

import { Text, Button, Flex, Icon, Link } from "@bitrise/bitkit";

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
}: ProductTooltipProps) => {
	if (!tip) {
		return null;
	}

	const onGotIt = () => {
		onButtonClick("got it");
		onClose();
	};

	return (
		<Flex
			style={{
				left: rect?.x,
				top: (rect?.y ?? 0) + (rect?.height ?? 0) + 20
			}}
			className="product-tooltip"
		>
			<Flex direction="horizontal" style={{ flexGrow: 1 }}>
				<div className="arrow-up" style={{ left: rect!.width / 2 - 5 }} />
				<Flex direction="vertical" style={{ flex: "1 0 0", gap: "8px" }}>
					<Text size="4" weight="bold">
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
								underline
								target="_blank"
								rel="noreferrer"
								href={tip.link}
								style={{ display: "inline-block", marginLeft: "4px" }}
							>
								Learn more
							</Link>
						)}
					</Text>
				</Flex>
				{!finished && (
					<Flex>
						<Button onClick={onClose} level="tertiary" style={{ padding: "0" }}>
							<Icon name="CloseSmall" textColor="grape-5" />
						</Button>
					</Flex>
				)}
			</Flex>

			<Flex direction="horizontal" className="product-tooltip__footer">
				<Flex
					borderRadius="x1"
					direction="horizontal"
					backgroundColor="gray-1"
					paddingHorizontal="x3"
					alignChildrenVertical="middle"
				>
					<Text size="2">{selectedIndex !== undefined && <p>{`${selectedIndex + 1}/${total}`}</p>}</Text>
				</Flex>

				{finished ? (
					<Button level="primary" size="small" onClick={onGotIt}>
						Got it
					</Button>
				) : (
					<Flex className="product-tooltip__navigation">
						<Button size="small" onClick={onPrev}>
							<Icon name="ChevronLeft" />
						</Button>
						<Button size="small" onClick={onNext}>
							<Icon name="ChevronRight" />
						</Button>
					</Flex>
				)}
			</Flex>
		</Flex>
	);
};
