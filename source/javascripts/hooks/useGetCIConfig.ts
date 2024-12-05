import { useQuery } from '@tanstack/react-query';
import BitriseYmlApi from '@/core/api/BitriseYmlApi';
import { ClientError } from '@/core/api/client';
import { BitriseYml } from '@/core/models/BitriseYml';

const useGetCiConfig = (projectSlug: string, readFromRepo?: boolean) => {
  return useQuery<BitriseYml, ClientError>({
    enabled: false,
    retry: false,
    queryKey: [BitriseYmlApi.getBitriseYmlPath({ projectSlug }), readFromRepo],
    queryFn: ({ signal }) => BitriseYmlApi.getBitriseYml({ projectSlug, readFromRepo, signal }),
    staleTime: Infinity,
  });
};

export default useGetCiConfig;
