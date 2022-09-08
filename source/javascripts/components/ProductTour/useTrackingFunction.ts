import { useCallback, useRef } from "react";
import { TrackingEvent } from "./types";

export const useTrackingFunction = (eventFunction: () => TrackingEvent) => {
	const cb = useRef<(() => TrackingEvent) | null>(null);
	cb.current = eventFunction;

	return useCallback(() => {
		if (window.analytics && cb.current) {
			const { event, payload } = cb.current();
			window.analytics.track(event, payload);
		}
	}, []);
};
