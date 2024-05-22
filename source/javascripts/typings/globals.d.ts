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
  }

  const process: {
    env: { [s: string]: any };
  };
}
