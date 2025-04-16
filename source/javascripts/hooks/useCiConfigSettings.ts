import { useMutation, UseMutationOptions, useQuery } from '@tanstack/react-query';

import BitriseYmlSettingsApi, { BitriseYmlSettingsResponse } from '@/core/api/BitriseYmlSettingsApi';
import { ClientError } from '@/core/api/client';
import { BitriseYmlSettings } from '@/core/models/BitriseYmlSettings';
import PageProps from '@/core/utils/PageProps';

function useCiConfigSettings() {
  const projectSlug = PageProps.appSlug();

  return useQuery({
    queryKey: [BitriseYmlSettingsApi.getYmlSettingsPath(projectSlug)],
    queryFn: ({ signal }) => BitriseYmlSettingsApi.getYmlSettings({ projectSlug, signal }),
    enabled: !!projectSlug,
  });
}

function usePutCiConfigSettings(
  options?: UseMutationOptions<BitriseYmlSettingsResponse | undefined, ClientError, Partial<BitriseYmlSettings>>,
) {
  const projectSlug = PageProps.appSlug();

  return useMutation<BitriseYmlSettingsResponse | undefined, ClientError, Partial<BitriseYmlSettings>>({
    mutationFn: (model) => BitriseYmlSettingsApi.updateYmlSettings({ projectSlug, model }),
    ...options,
  });
}

export { useCiConfigSettings, usePutCiConfigSettings };
