import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import BitriseYmlSettingsApi, { BitriseYmlSettingsResponse } from '@/core/api/BitriseYmlSettingsApi';
import { ClientError } from '@/core/api/client';
import { BitriseYmlSettings } from '@/core/models/BitriseYmlSettings';

type MutationProps = {
  model: Partial<BitriseYmlSettings>;
  projectSlug: string;
};

const usePutCiConfigSettingsMutation = (
  options: UseMutationOptions<BitriseYmlSettingsResponse | undefined, ClientError, MutationProps>,
) => {
  return useMutation({
    mutationFn: ({ projectSlug, model }) => BitriseYmlSettingsApi.updateYmlSettings({ projectSlug, model }),
    ...options,
  });
};

export { usePutCiConfigSettingsMutation };
