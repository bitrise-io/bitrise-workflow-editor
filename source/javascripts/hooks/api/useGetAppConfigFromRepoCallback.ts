import { AppConfig } from '@/core/AppConfig';
import useMonolithApiCallback, { MonolithError } from './useMonolithApiCallback';

export interface FetchResponse {
  appConfigFromRepo: AppConfig | undefined;
  getAppConfigFromRepoStatus?: number;
  getAppConfigFromRepoLoading: boolean;
  getAppConfigFromRepoFailed: MonolithError | undefined;
  getAppConfigFromRepo: () => void;
  getAppConfigFromRepoReset: () => void;
}

export default function useGetAppConfigFromRepoCallback(appSlug: string): FetchResponse {
  const {
    statusCode: getAppConfigFromRepoStatus,
    loading: getAppConfigFromRepoLoading,
    failed: getAppConfigFromRepoFailed,
    call: getAppConfigFromRepo,
    result: appConfigFromRepo,
    reset: getAppConfigFromRepoReset,
  } = useMonolithApiCallback<AppConfig>(`/api/app/${appSlug}/config?is_force_from_repo=1`);

  return {
    getAppConfigFromRepoStatus,
    getAppConfigFromRepoLoading,
    getAppConfigFromRepoFailed,
    getAppConfigFromRepo,
    appConfigFromRepo,
    getAppConfigFromRepoReset,
  };
}
