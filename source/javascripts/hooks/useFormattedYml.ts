import { useMutation } from '@tanstack/react-query';
import BitriseYmlApi from '@/core/api/BitriseYmlApi';
import { BitriseYml } from '@/core/models/BitriseYml';

const useFormattedYml = () => {
  return useMutation({
    mutationFn: (ciConfig: BitriseYml) => BitriseYmlApi.formatYml(ciConfig),
  });
};

export default useFormattedYml;
