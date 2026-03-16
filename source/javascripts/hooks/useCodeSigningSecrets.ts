import { useQuery } from '@tanstack/react-query';

import SecretApi from '@/core/api/SecretApi';
import PageProps from '@/core/utils/PageProps';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

const useCodeSigningSecrets = (enabled: boolean) => {
  const appSlug = PageProps.appSlug();
  const projectType = useBitriseYmlStore((s) => s.yml.project_type);

  return useQuery({
    enabled: enabled && !!appSlug,
    initialData: [],
    queryKey: ['app', appSlug, 'code-signing-secrets', projectType],
    queryFn: ({ signal }) => SecretApi.getCodeSigningSecrets({ appSlug, projectType, signal }),
  });
};

export default useCodeSigningSecrets;
