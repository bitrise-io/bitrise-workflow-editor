import { YmlSettings } from '@/core/YmlSettings';
import Client from '@/api/client';

// DTOs
type YmlSettingsDto = {
  last_modified: string;
  lines: number;
  split: boolean;
  uses_repository_yml: boolean;
  modular_yaml_supported: boolean;
};

// TRANSFORMATIONS
function toYmlSettings(response: YmlSettingsDto): YmlSettings {
  return {
    lastModified: response.last_modified,
    lines: response.lines,
    isYmlSplit: response.split,
    isRepositoryYml: response.uses_repository_yml,
    isModularYamlSupported: response.modular_yaml_supported,
  };
}

function toYmlSettingUpdateModel(model: Partial<YmlSettings>): Pick<YmlSettingsDto, 'uses_repository_yml'> {
  return {
    uses_repository_yml: Boolean(model?.isRepositoryYml),
  };
}

// API CALLS
const PIPELINE_CONFIG_PATH = 'app/:appSlug/pipeline_config';

function getYmlSettingsPath(appSlug: string): string {
  return PIPELINE_CONFIG_PATH.replace(':appSlug', appSlug);
}

async function getYmlSettings({ appSlug, signal }: { appSlug: string; signal?: AbortSignal }): Promise<YmlSettings> {
  const response = await Client.get<YmlSettingsDto>(getYmlSettingsPath(appSlug), {
    signal,
  });
  return toYmlSettings(response);
}

function updateYmlSettings({
  appSlug,
  model,
  signal,
}: {
  appSlug: string;
  model: Partial<YmlSettings>;
  signal?: AbortSignal;
}): Promise<unknown> {
  return Client.put<unknown>(getYmlSettingsPath(appSlug), {
    body: JSON.stringify(toYmlSettingUpdateModel(model)),
    signal,
  });
}

export default {
  getYmlSettingsPath,
  getYmlSettings,
  getUpdateYmlSettingsPath: getYmlSettingsPath,
  updateYmlSettings,
};
