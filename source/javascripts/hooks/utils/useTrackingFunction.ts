import { useCallback, useRef } from "react";

export interface TrackingEvent {
	event: string;
	payload: Record<string, string | number | null | undefined>;
}

type TrackingFunction<T = undefined> = (data: T) => TrackingEvent;

export const useTrackingFunction = <T>(eventFunction: TrackingFunction<T>) => {
	const cb = useRef<TrackingFunction<T>>(eventFunction);
	cb.current = eventFunction;

	return useCallback((data?: T) => {
		if (window.analytics && cb.current) {
			const { event, payload } = cb.current(data!);
			window.analytics.track(event, payload);
		}
	}, []);
};
