import { useQuery, UseQueryOptions } from '@tanstack/react-query';

type QueryOpts<T> = Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>;

export default function useGetUserMetaData<T>(key: string, options?: QueryOpts<T>) {
  const url = `/me/profile/metadata.json?key=${key}`;
  return useQuery<T>({
    queryKey: ['metadata', key, url],
    queryFn: async () => {
      const response = await fetch(url);
      return (await response.json()) as T;
    },
    ...options,
  });
}
