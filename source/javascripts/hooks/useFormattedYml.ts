import { useQuery } from '@tanstack/react-query';
import BitriseYmlApi from '@/core/api/BitriseYmlApi';
import { BitriseYml } from '../core/models/BitriseYml';

const useFormattedYml = (appConfig: BitriseYml) => {
  return useQuery({
    queryKey: ['format-yml', appConfig],
    queryFn: ({ signal }) =>
      BitriseYmlApi.formatYml({
        model: appConfig,
        signal,
      }),
    staleTime: Infinity,
  });
};

export default useFormattedYml;
