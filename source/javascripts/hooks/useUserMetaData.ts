import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import UserApi from '../core/api/UserApi';

const useUserMetaData = (key: string, enabled: boolean) => {
  const [value, setValue] = useState<string | undefined | null>(undefined);
  const { data } = useQuery({
    enabled,
    queryKey: ['userMetaData', key],
    queryFn: () => UserApi.getUserMetadataValue({ key }),
    staleTime: Infinity,
  });

  const { mutate } = useMutation({
    mutationFn: (newValue: string) =>
      UserApi.updateUserMetadata({
        metadata: {
          [key]: newValue,
        },
      }),
    onMutate: (variables) => {
      setValue(variables);
    },
  });

  useEffect(() => {
    setValue(data);
  }, [data]);

  return { value, update: mutate };
};

export default useUserMetaData;
