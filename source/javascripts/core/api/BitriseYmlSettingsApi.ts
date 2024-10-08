import { BitriseYmlSettings } from '@/core/models/BitriseYmlSettings';
import Client from './client'; // DTOs

// DTOs
type BitriseYmlSettingsResponse = {
  last_modified: string;
  lines: number;
  split: boolean;
  uses_repository_yml: boolean;
  modular_yaml_supported: boolean;
};

type BitriseYmlSettingsRequest = {
  uses_repository_yml: boolean;
};

// TRANSFORMATIONS
function toYmlSettings(response: BitriseYmlSettingsResponse): BitriseYmlSettings {
  return {
    lastModified: response.last_modified,
    lines: response.lines,
    isYmlSplit: response.split,
    isRepositoryYml: response.uses_repository_yml,
    isModularYamlSupported: response.modular_yaml_supported,
  };
}

function toYmlSettingUpdateModel(model: Partial<BitriseYmlSettings>): BitriseYmlSettingsRequest {
  return {
    uses_repository_yml: Boolean(model?.isRepositoryYml),
  };
}

// API CALLS
const PIPELINE_CONFIG_PATH = 'app/:appSlug/pipeline_config';

function getYmlSettingsPath(appSlug: string): string {
  return PIPELINE_CONFIG_PATH.replace(':appSlug', appSlug);
}

async function getYmlSettings({
  appSlug,
  signal,
}: {
  appSlug: string;
  signal?: AbortSignal;
}): Promise<BitriseYmlSettings> {
  const response = await Client.get<BitriseYmlSettingsResponse>(getYmlSettingsPath(appSlug), {
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
  model: Partial<BitriseYmlSettings>;
  signal?: AbortSignal;
}): Promise<BitriseYmlSettingsResponse> {
  return Client.put<BitriseYmlSettingsResponse>(getYmlSettingsPath(appSlug), {
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
