import { useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import useGetUserMetaData from '@/hooks/api/useGetUserMetaData';
import { monolith } from './api/client';

type MetadataResult = {
  value: boolean | null;
};

type Props = {
  key: string;
  enabled: boolean;
};

type NotificationResult = {
  isVisible: boolean;
  close: VoidFunction;
};

const useUserMetaData = ({ key, enabled }: Props): NotificationResult => {
  const { mutate } = useMutation({
    mutationFn: (value: boolean) =>
      monolith.put('/me/profile/metadata.json', {
        [key]: value,
      }),
    onSuccess: () => {
      refetch();
    },
  });
  const { data: metadata, refetch } = useGetUserMetaData<MetadataResult>(key, {
    enabled,
  });

  const close = () => {
    mutate(true);
  };

  const isVisible = useMemo(() => Boolean(metadata && metadata.value === null), [metadata]);
  return { isVisible, close };
};

export { useUserMetaData };
