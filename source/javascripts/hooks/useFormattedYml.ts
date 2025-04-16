import { useMutation, UseMutationOptions, useQuery, UseQueryOptions } from '@tanstack/react-query';

import BitriseYmlApi from '@/core/api/BitriseYmlApi';
import { ClientError } from '@/core/api/client';
import { BitriseYml } from '@/core/models/BitriseYml'; // Prepare the YAML string for formatting

export const useFormatYml = (options?: UseMutationOptions<string, ClientError, string | BitriseYml>) => {
  return useMutation({
    mutationFn: (yml) => BitriseYmlApi.formatCiConfig(BitriseYmlApi.toYml(yml)),
    ...options,
  });
};

const useFormattedYml = (
  yml: string | BitriseYml,
  options?: Omit<UseQueryOptions<string, ClientError, string>, 'queryKey' | 'queryFn' | 'enabled'>,
) => {
  const data = BitriseYmlApi.toYml(yml);

  return useQuery({
    queryKey: ['formattedYml', data],
    queryFn: () => BitriseYmlApi.formatCiConfig(data),
    enabled: !!data,
    ...options,
  });
};

export default useFormattedYml;
