import { BitriseYmlSettings } from '@/core/models/BitriseYmlSettings';
import Client from './client';

// DTOs
export type BitriseYmlSettingsResponse = {
  last_modified: string | null;
  lines: number;
  split: boolean;
  uses_repository_yml: boolean;
  modular_yaml_supported: boolean;
  yml_root_path: string | null;
};

type BitriseYmlSettingsRequest = {
  uses_repository_yml: boolean;
  yml_root_path: string;
};

// TRANSFORMATIONS
function toYmlSettings(response: BitriseYmlSettingsResponse): BitriseYmlSettings {
  return {
    lastModified: response.last_modified,
    lines: response.lines,
    isYmlSplit: response.split,
    isModularYamlSupported: response.modular_yaml_supported,
    usesRepositoryYml: response.uses_repository_yml,
    ymlRootPath: response.yml_root_path,
  };
}

function toYmlSettingUpdateModel(model: Partial<BitriseYmlSettings>): BitriseYmlSettingsRequest {
  return {
    uses_repository_yml: Boolean(model?.usesRepositoryYml),
    yml_root_path: model?.ymlRootPath || '',
  };
}

// API CALLS
const YML_SETTINGS_PATH = 'app/:projectSlug/pipeline_config';

function getYmlSettingsPath(projectSlug: string): string {
  return YML_SETTINGS_PATH.replace(':projectSlug', projectSlug);
}

async function getYmlSettings({
  projectSlug,
  signal,
}: {
  projectSlug: string;
  signal?: AbortSignal;
}): Promise<BitriseYmlSettings> {
  const response = await Client.get<BitriseYmlSettingsResponse>(getYmlSettingsPath(projectSlug), {
    signal,
  });

  return toYmlSettings(response);
}

function updateYmlSettings({
  projectSlug,
  model,
  signal,
}: {
  projectSlug: string;
  model: Partial<BitriseYmlSettings>;
  signal?: AbortSignal;
}): Promise<BitriseYmlSettingsResponse | undefined> {
  return Client.put<BitriseYmlSettingsResponse>(getYmlSettingsPath(projectSlug), {
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
