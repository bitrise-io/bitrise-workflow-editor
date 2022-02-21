import { WFEWindow } from "../typings/global";

interface HotjarApi {
	(action: "tagRecording", tags: string[]): void;
}

export default class Hotjar {
	static tagRecording(tagName: string): void {
		this.getHotjarApi()("tagRecording", [tagName]);
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
