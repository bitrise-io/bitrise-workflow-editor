import { useMutation } from '@tanstack/react-query';
import { stringify } from 'yaml';
import BitriseYmlApi from '@/core/api/BitriseYmlApi';
import { ClientError } from '@/core/api/client';
import { BitriseYml } from '@/core/models/BitriseYml';

const useFormattedYml = () => {
  return useMutation<string, ClientError, BitriseYml | string>({
    mutationFn: (data) => {
      if (typeof data === 'string') {
        return BitriseYmlApi.formatCiConfig(data);
      }
      return BitriseYmlApi.formatCiConfig(stringify(data));
    },
  });
};

export default useFormattedYml;
