import { useQuery } from '@tanstack/react-query';
import BitriseYmlApi from '@/core/api/BitriseYmlApi';
import { ClientError } from '@/core/api/client';
import { BitriseYml } from '@/core/models/BitriseYml';

type Props = { enabled?: boolean; projectSlug: string; readFromRepo?: boolean };

const useGetCiConfig = (props: Props) => {
  const { enabled, projectSlug, readFromRepo } = props;

  return useQuery<BitriseYml, ClientError>({
    enabled,
    retry: false,
    queryKey: [BitriseYmlApi.getBitriseYmlPath({ projectSlug }), readFromRepo],
    queryFn: ({ signal }) => BitriseYmlApi.getBitriseYml({ projectSlug, readFromRepo, signal }),
    staleTime: Infinity,
  });
};

export default useGetCiConfig;
