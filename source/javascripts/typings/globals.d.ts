import { LogsPublicApi } from '@datadog/browser-logs/cjs/boot/logsPublicApi';
import { BitriseYml } from '@/core/models/BitriseYml';

export {};

declare global {
  const TEST_BITRISE_YML: BitriseYml;

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
    serviceVersion: string;
    datadogApiKey: string;
    isAnalyticsOn: boolean;
    datadogLogs: LogsPublicApi;
    mode: 'website' | 'cli';

    dataLayer?: object[];
    globalProps?: {
      user: {
        slug: string;
        username: string;
      };
      account: {
        slug: string;
        name: string;
      };
      env?: {
        SEGMENT_JS_WRITE_KEY_NEW: string;
      };
      featureFlags?: {
        user: { [s: string]: unknown };
        account: { [s: string]: unknown };
      };
    };
    pageProps?: {
      abilities?: {
        canRunBuilds: boolean;
      };
      limits?: {
        uniqueStepLimit?: number;
        isPipelinesAvailable?: boolean;
        isRepositoryYmlAvailable?: boolean;
      };
      project?: {
        slug: string;
        name: string;
        defaultBranch?: string;
        buildTriggerToken?: string;
        gitRepoSlug?: string;
      };
      settings?: {
        statusReport?: {
          defaultProjectBasedStatusNameTemplate: string;
          defaultTargetBasedStatusNameTemplate: string;
          projectLevelCustomStatusNameTemplate: string | null;
          variables: Record<string, string | null>;
        };
      };
    };
  }

  const process: {
    env: { [s: string]: any };
  };
}
