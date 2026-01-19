/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MODE: string;
  readonly CLARITY: string;
  readonly ANALYTICS: string;
  readonly DATADOG_RUM: string;
  readonly NODE_ENV: string;
  readonly PUBLIC_URL_ROOT: string;
  readonly DEV_SERVER_PORT: string;
  readonly CLARITY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Extend window interface for custom properties
interface Window {
  env: {
    MODE: string;
    CLARITY: string;
    ANALYTICS: string;
    DATADOG_RUM: string;
    NODE_ENV: string;
    PUBLIC_URL_ROOT: string;
    WFE_VERSION: string;
  };
  localFeatureFlags: Record<string, any>;
}
