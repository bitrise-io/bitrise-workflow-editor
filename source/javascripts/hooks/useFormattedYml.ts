import { useMutation } from '@tanstack/react-query';
import BitriseYmlApi from '@/core/api/BitriseYmlApi';
import { ClientError } from '@/core/api/client';
import { BitriseYml } from '@/core/models/BitriseYml';

const useFormattedYml = () => {
  return useMutation<string, ClientError, BitriseYml | string>({
    mutationFn: BitriseYmlApi.formatCiConfig,
  });
};

export default useFormattedYml;
