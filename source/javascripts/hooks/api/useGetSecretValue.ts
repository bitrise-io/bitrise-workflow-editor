import useMonolithApiCallback, { MonolithError } from './useMonolithApiCallback';

export interface FetchResponse {
  call: () => void;
  value: string | undefined;
  isLoading: boolean;
  failed: MonolithError | undefined;
}

export default function useGetSecretValue(appSlug: string, secretSlug: string): FetchResponse {
  const {
    call,
    loading: isLoading,
    failed,
    result,
  } = useMonolithApiCallback<{ value: string }>(`/api/app/${appSlug}/secrets/${secretSlug}`);

  return {
    call,
    failed,
    isLoading,
    value: result?.value,
  };
}
