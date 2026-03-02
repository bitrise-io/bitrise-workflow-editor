/* eslint-disable @typescript-eslint/no-explicit-any */
import { BitriseYml } from '@/core/models/BitriseYml';

export {};

declare global {
  const TEST_BITRISE_YML: BitriseYml;

  interface Window {
    DD_RUM: typeof import('@datadog/browser-rum').datadogRum | undefined;
    // webpack.config.js
    localFeatureFlags: Partial<{
      [s: string]: string | number | boolean;
    }>;

    dataLayer?: object[];
    globalProps?: {
      user: {
        slug: string;
        username: string;
      };
      account: {
        slug: string;
        name: string;
        sharedResourcesAvailable?: boolean;
        useReplacementForDeprecatedMachines?: any;
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
        allowNonBitriseSteps?: boolean;
      };
      project?: {
        slug: string;
        name: string;
        defaultBranch?: string;
        buildTriggerToken?: string;
        gitRepoSlug?: string;
        isOwnerPaying?: boolean;
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
    env: {
      CLARITY: 'true' | 'false';
      ANALYTICS: 'true' | 'false';
      DATADOG_RUM: 'true' | 'false';
      MODE: 'WEBSITE' | 'CLI';
      NODE_ENV: 'development' | 'production';
      PUBLIC_URL_ROOT: string;
      WFE_VERSION: string;
    };
  }

  const process: {
    env: { [s: string]: any };
  };
}
