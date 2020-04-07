export type WFEWindow = Window &
	typeof globalThis & {
		datadogLogs: unknown;
    DATADOG_API_KEY: string;
    isAnalyticsOn: boolean;
    mode: string;
    serviceName: string;
	};
