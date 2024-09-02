import { useQuery, UseQueryOptions } from '@tanstack/react-query';

type QueryOpts<T> = Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>;

const MetadataUrl = `/me/profile/metadata.json?key=:key`;

function getMetadataUrlFor(key: string) {
  return MetadataUrl.replace(':key', key);
}

export default function useGetUserMetaData<T>(key: string, options?: QueryOpts<T>) {
  return useQuery<T>({
    queryKey: ['metadata', { key }],
    queryFn: async () => {
      const response = await fetch(getMetadataUrlFor(key));
      return (await response.json()) as T;
    },
    ...options,
  });
}
