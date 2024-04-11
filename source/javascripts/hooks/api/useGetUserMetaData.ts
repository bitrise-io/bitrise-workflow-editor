import useMonolithApiCallback, { MonolithError } from './useMonolithApiCallback';

export interface FetchResponse {
  call: () => void;
  value: boolean | undefined;
  isLoading: boolean;
  failed: MonolithError | undefined;
}

export default function useGetUserMetaData(key: string): FetchResponse {
  const {
    call,
    loading: isLoading,
    failed,
    result,
  } = useMonolithApiCallback<{ value: boolean }>(`/me/profile/metadata.json?key=${key}`);

  return {
    call,
    failed,
    isLoading,
    value: result?.value,
  };
}
