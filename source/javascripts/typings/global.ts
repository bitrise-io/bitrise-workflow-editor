export type WFEWindow = Window &
	typeof globalThis & {
		datadogLogs: any;
		DATADOG_API_KEY: string;
	};
