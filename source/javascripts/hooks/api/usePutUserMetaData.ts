import useMonolithApiCallback, { MonolithError } from './useMonolithApiCallback';

export interface FetchResponse {
  call: () => void;
  result: { value: boolean } | undefined;
  isLoading: boolean;
  failed: MonolithError | undefined;
}

export default function useGetUserMetaData(key: string, value: boolean): FetchResponse {
  const {
    call,
    loading: isLoading,
    failed,
    result,
  } = useMonolithApiCallback<{ value: boolean }>(`/me/profile/metadata.json`, {
    method: 'PUT',
    body: JSON.stringify({
      [key]: value,
    }),
  });

  return {
    call,
    failed,
    isLoading,
    result,
  };
}
