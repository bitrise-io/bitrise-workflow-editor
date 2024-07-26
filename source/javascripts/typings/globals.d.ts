import { LogsPublicApi } from '@datadog/browser-logs/cjs/boot/logsPublicApi';

export {};

declare global {
  interface Window {
    // strings.js.erb
    strings: { [s: string]: any };

    // routes.js.erb
    routes: { [s: string]: any };

    // webpack.config.js
    localFeatureFlags: Partial<{
      [s: string]: string | number | boolean;
    }>;

    analytics: {
      track: (event: string, payload: Record<string, string | number | null | undefined>) => void;
    };
    segmentWriteKey: string;
    serviceVersion: string;
    datadogApiKey: string;
    isAnalyticsOn: boolean;
    datadogLogs: LogsPublicApi;
    mode: 'website' | 'cli';

    dataLayer?: object[];
    globalProps?: {
      featureFlags?: {
        user: { [s: string]: unknown };
        account: { [s: string]: unknown };
      };
    };
  }

  const process: {
    env: { [s: string]: any };
  };
}
