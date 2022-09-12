import React from "react";
import { useEffect, useReducer } from "react";

import { Text, Button, Flex, Icon, Link } from "@bitrise/bitkit";

import "./ProductTooltip.scss";

import { State, Action, Tips } from "./types";

interface ProductTooltipProps {
	tips: Tips[];
	rect: DOMRect | null;
	onClose: () => void;
	onChange: (id: string) => void;
	onButtonClick: (data?: string) => void;
}

const initialState: State = {
	items: [],
	finished: false
};

function reducer(state: State, { type, payload }: Action): State {
	switch (type) {
		case "reset": {
			return initialState;
		}
		case "init": {
			const selectedId = (payload as Tips[])[0].id;
			const selectedIndex = 0;
			const finished = selectedIndex === (payload as Tips[]).length - 2;
			return { selectedId, selectedIndex, items: payload as Tips[], finished };
		}

		case "select": {
			const found = state.items?.find(item => item.id === payload);
			if (found) {
				const selectedIndex = state.items.indexOf(found);
				const finished = selectedIndex === state.items.length - 1;
				return { ...state, selectedId: found.id, selectedIndex, finished };
			}
			break;
		}
		case "next": {
			const { selectedIndex, items } = state;
			if (selectedIndex !== undefined) {
				const nextIndex = selectedIndex + 1;
				const found = items[nextIndex];
				if (found) {
					const finished = selectedIndex === items.length - 2;
					return {
						...state,
						selectedId: found.id,
						selectedIndex: nextIndex,
						finished
					};
				}
			}
			break;
		}
		case "prev": {
			const { selectedIndex, items } = state;
			if (selectedIndex) {
				const prevIndex = selectedIndex - 1;
				const found = items[prevIndex];
				if (found) {
					const finished = prevIndex === items.length - 2;
					return {
						...state,
						selectedId: found.id,
						selectedIndex: prevIndex,
						finished
					};
				}
			}
			break;
		}
	}

	return state;
}

export const ProductTooltip = ({ tips, rect, onClose, onChange, onButtonClick }: ProductTooltipProps) => {
	const [{ items, finished, selectedIndex, selectedId }, dispatch] = useReducer(reducer, initialState);

	const tip = items[selectedIndex ?? 0];

	useEffect(() => {
		dispatch({ type: "init", payload: tips });
	}, [tips]);

	const onNext = () => {
		dispatch({ type: "next", payload: undefined });
	};

	const onPrev = () => {
		dispatch({ type: "prev", payload: undefined });
	};

	useEffect(() => {
		if (selectedId !== undefined) {
			onChange(selectedId);
		}
	}, [selectedId, onChange]);

	const onGotIt = () => {
		onButtonClick("got it");
		onClose();
	};

	if (!tip) {
		return null;
	}

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
					<Text size="2">{selectedIndex !== undefined && <p>{`${selectedIndex + 1}/${items.length}`}</p>}</Text>
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
