import { useCallback, useEffect, useReducer } from "react";
import { Tips, State, Action } from "./types";

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
			if (payload && payload.length) {
				const selectedId = (payload as Tips[])[0].id;
				const selectedIndex = 0;
				const finished = selectedIndex === (payload as Tips[]).length - 2;
				return { selectedId, selectedIndex, items: payload as Tips[], finished };
			}
			return state;
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

export const useProductTour = (tips: Tips[]) => {
	const [{ items, finished, selectedIndex, selectedId }, dispatch] = useReducer(reducer, initialState);

	const tip = items[selectedIndex ?? 0];

	useEffect(() => {
		dispatch({ type: "init", payload: tips });
	}, [tips]);

	const onRestart = useCallback(() => {
		dispatch({ type: "select", payload: tips[0].id});
	}, [dispatch, tips]); 

	const onNext = useCallback(() => {
		dispatch({ type: "next", payload: undefined });
	}, [dispatch]);

	const onPrev = useCallback(() => {
		dispatch({ type: "prev", payload: undefined });
	}, [dispatch]);

	return {
		items,
		finished,
		selectedId,
		selectedIndex,
		tip,
		onPrev,
		onNext,
		onRestart
	};
};
