import { AppConfig } from '@/core/AppConfig';
import useMonolithApiCallback, { MonolithError } from './useMonolithApiCallback';

export interface FetchResponse {
  appConfig: AppConfig | undefined;
  getAppConfigStatus?: number;
  getAppConfigLoading: boolean;
  getAppConfigFailed: MonolithError | undefined;
  getAppConfig: () => void;
}

export default function useGetAppConfigCallback(appSlug: string): FetchResponse {
  const {
    statusCode: getAppConfigStatus,
    loading: getAppConfigLoading,
    failed: getAppConfigFailed,
    call: getAppConfig,
    result: appConfig,
  } = useMonolithApiCallback<AppConfig>(`/api/app/${appSlug}/config`);

  return {
    getAppConfigStatus,
    getAppConfigLoading,
    getAppConfigFailed,
    getAppConfig,
    appConfig,
  };
}
