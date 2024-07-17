import { useCallback, useMemo } from 'react';
import usePutUserMetaData from '@/hooks/api/usePutUserMetaData';
import useGetUserMetaData from '@/hooks/api/useGetUserMetaData';

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

const useMetadata = ({ key, enabled }: Props): NotificationResult => {
  const { mutate: putMetadata } = usePutUserMetaData(key);
  const { data: metadata, refetch } = useGetUserMetaData<MetadataResult>(key, {
    enabled,
  });

  const close = useCallback(() => {
    console.log('Sending metadata update');
    putMetadata(true, {
      onSuccess: () => {
        console.log('Successfully updated metadata');
        refetch();
      },
    });
  }, [putMetadata, refetch]);

  const isVisible = useMemo(() => Boolean(metadata && metadata.value === null), [metadata]);
  return { isVisible, close };
};

export { useMetadata };
