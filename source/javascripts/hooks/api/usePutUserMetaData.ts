import { useMutation } from '@tanstack/react-query';

export default function usePutUserMetaData(key: string) {
  const url = '/me/profile/metadata.json';
  return useMutation({
    mutationKey: ['metadata', key, url],
    mutationFn: async (value: boolean | null) => {
      await fetch(url, {
        method: 'PUT',
        body: JSON.stringify({
          [key]: value,
        }),
      });
    },
  });
}
