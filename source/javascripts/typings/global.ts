export type WFEWindow = Window &
	typeof globalThis & {
		datadogLogs: any;
		DATADOG_API_KEY: string;
		isAnalyticsOn: boolean;
		mode: string;
		serviceName: string;
		strings: { [s: string]: unknown };
	};
