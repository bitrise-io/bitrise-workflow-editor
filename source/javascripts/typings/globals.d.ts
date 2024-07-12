export {};

declare global {
  interface Window {
    strings: { [s: string]: any };
    routes: { [s: string]: any };
    analytics: {
      track: (event: string, payload: Record<string, string | number | null | undefined>) => void;
    };
    globalProps?: {
      featureFlags?: {
        user: { [s: string]: unknown };
        account: { [s: string]: unknown };
      };
    };
    localFeatureFlags: Partial<{
      [s: string]: string | number | boolean;
    }>;
  }

  const process: {
    env: { [s: string]: any };
  };
}
