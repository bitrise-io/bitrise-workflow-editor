import { useMutation } from '@tanstack/react-query';

export default function useGetUserMetaData(key: string, value: boolean) {
  const url = '/me/profile/metadata.json';
  return useMutation({
    mutationKey: ['metadata', key, value, url],
    mutationFn: async () => {
      await fetch(url, {
        method: 'PUT',
        body: JSON.stringify({
          [key]: value,
        }),
      });
    },
  });
}
