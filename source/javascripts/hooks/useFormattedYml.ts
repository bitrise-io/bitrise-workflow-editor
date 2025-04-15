import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import BitriseYmlApi from '@/core/api/BitriseYmlApi';
import { BitriseYml } from '@/core/models/BitriseYml'; // Prepare the YAML string for formatting
import { ClientError } from '@/core/api/client';

const prepareYml = (data: string | BitriseYml): string => {
  if (typeof data === 'string') {
    return data;
  }
  return BitriseYmlApi.toYml(data);
};

const useFormattedYml = (
  yml: string | BitriseYml,
  options?: Omit<UseQueryOptions<string, ClientError, string>, 'queryKey' | 'queryFn' | 'enabled'>,
) => {
  const data = prepareYml(yml);

  return useQuery({
    queryKey: ['formattedYml', data],
    queryFn: () => BitriseYmlApi.formatCiConfig(data),
    enabled: !!data,
    ...options,
  });
};

export default useFormattedYml;
