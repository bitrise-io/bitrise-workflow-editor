import React from "react";
import { useEffect, useReducer } from "react";
import "./ProductTooltip.scss";

import { State, Action, Tips } from "./types";

interface ProductTooltipProps {
	tips: Tips[];
	rect: DOMRect | null;
	onClose: () => void;
	onChange: (id: string) => void;
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
			if (selectedIndex !== undefined) {
				const prevIndex = Math.max(selectedIndex - 1, 0);
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

export const ProductTooltip = ({ tips, rect, onClose, onChange }: ProductTooltipProps) => {
	const tip = tips[0];

	const [{ items, finished, selectedIndex, selectedId }, dispatch] = useReducer(reducer, initialState);

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

	return (
		<div
			style={{
				left: rect?.x,
				top: (rect?.y ?? 0) + (rect?.height ?? 0) + 10
			}}
			className="product-tooltip"
		>
			<p>{tip.title}</p>
			<p>{tip.description}</p>

			<div className="product-tooltip__footer">
				{selectedIndex !== undefined && <p>{`${selectedIndex + 1}/${items.length}`}</p>}

				{finished ? (
					<button onClick={onClose}>got it</button>
				) : (
					<div className="product-tooltip__navigation">
						<button onClick={onPrev}>&lt;</button>
						<button onClick={onNext}>&gt;</button>
					</div>
				)}
			</div>
		</div>
	);
};
