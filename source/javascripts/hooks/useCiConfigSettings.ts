import {
  DefinedInitialDataOptions,
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import BitriseYmlSettingsApi, { BitriseYmlSettingsResponse } from '@/core/api/BitriseYmlSettingsApi';
import { ClientError } from '@/core/api/client';
import { BitriseYmlSettings } from '@/core/models/BitriseYmlSettings';
import PageProps from '@/core/utils/PageProps';

type UseBitriseYmlSettingsOptions = Omit<
  DefinedInitialDataOptions<BitriseYmlSettings, ClientError>,
  'queryKey' | 'queryFn'
>;

const defaultInitialData: BitriseYmlSettings = {
  lastModified: null,
  lines: 0,
  isYmlSplit: false,
  isModularYamlSupported: false,
  usesRepositoryYml: false,
  ymlRootPath: null,
};

function useCiConfigSettings(options?: UseBitriseYmlSettingsOptions) {
  const projectSlug = PageProps.appSlug();

  return useQuery({
    queryKey: [BitriseYmlSettingsApi.getYmlSettingsPath(projectSlug)],
    queryFn: ({ signal }) => BitriseYmlSettingsApi.getYmlSettings({ projectSlug, signal }),
    enabled: !!projectSlug,
    initialData: defaultInitialData,
    ...options,
  });
}

function usePutCiConfigSettings(
  options: UseMutationOptions<BitriseYmlSettingsResponse | undefined, ClientError, Partial<BitriseYmlSettings>>,
) {
  const projectSlug = PageProps.appSlug();
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options || {};

  return useMutation<BitriseYmlSettingsResponse | undefined, ClientError, Partial<BitriseYmlSettings>>({
    mutationFn: (model) => BitriseYmlSettingsApi.updateYmlSettings({ projectSlug, model }),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: [BitriseYmlSettingsApi.getYmlSettingsPath(projectSlug)],
      });
      onSuccess?.(...args);
    },
    ...restOptions,
  });
}

export { useCiConfigSettings, usePutCiConfigSettings };
