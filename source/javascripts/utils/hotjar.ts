import { WFEWindow } from "../typings/global";

interface HotjarApi {
	(action: "event", eventName: string): void;
}

export default class Hotjar {
	static event(eventName: string): void {
		const isMatching = /^[-a-zA-Z0-9_]{1,749}$/.test(eventName);
		if (isMatching) {
			this.getHotjarApi()("event", eventName);
		} else {
			console.error(`Invalid event: '${eventName}'!\nOnly a-z, A-Z, 0-9, - or _ chars, and max 750 chars!`);
		}
	}

	private static getHotjarApi(): HotjarApi {
		const w = window as WFEWindow;

		w.hj =
			w.hj ||
			(function () {
				// eslint-disable-next-line prefer-rest-params
				((w.hj as any).q = (w.hj as any).q || []).push(arguments);
			} as HotjarApi);

		return w.hj as HotjarApi;
	}
}
