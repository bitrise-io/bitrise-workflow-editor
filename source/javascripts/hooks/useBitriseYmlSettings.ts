import { DefinedInitialDataOptions, useQuery } from '@tanstack/react-query';
import BitriseYmlSettingsApi from '@/core/api/BitriseYmlSettingsApi';
import PageProps from '@/core/utils/PageProps';
import { BitriseYmlSettings } from '@/core/models/BitriseYmlSettings';
import { ClientError } from '@/core/api/client';

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

export default function useBitriseYmlSettings(options?: UseBitriseYmlSettingsOptions) {
  const projectSlug = PageProps.appSlug();

  return useQuery({
    queryKey: [BitriseYmlSettingsApi.getYmlSettingsPath(projectSlug)],
    queryFn: ({ signal }) => BitriseYmlSettingsApi.getYmlSettings({ projectSlug, signal }),
    enabled: !!projectSlug,
    initialData: defaultInitialData,
    ...options,
  });
}
