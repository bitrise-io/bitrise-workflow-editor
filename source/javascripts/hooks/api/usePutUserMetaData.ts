import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import { monolith } from './client';

export default function usePutUserMetaData(key: string, options?: UseMutationOptions) {
  const url = '/me/profile/metadata.json';
  return useMutation({
    mutationFn: (value: boolean) =>
      monolith.put(url, {
        [key]: value,
      }),
    ...options,
  });
}
