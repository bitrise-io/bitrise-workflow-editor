import { stringify } from 'yaml';
import { BitriseYml } from '@/core/BitriseYml';
import Client from './client';

// TRANSFORMATIONS
function toBitriseYml(data: string): BitriseYml {
  return JSON.parse(data) as BitriseYml;
}

function toJSON(model: BitriseYml): string {
  return JSON.stringify({
    app_config_datastore_yaml: toYml(model),
  });
}

function toYml(model?: BitriseYml): string {
  if (!model) {
    return '';
  }

  return `---\n${stringify(model)}`;
}

// API CALLS
const BITRISE_YML_PATH = `/api/app/:appSlug/config`;

function getBitriseYmlPath({ appSlug, readFromRepo = false }: { appSlug: string; readFromRepo?: boolean }): string {
  return `${BITRISE_YML_PATH.replace(':appSlug', appSlug)}${readFromRepo ? '?is_force_from_repo=1' : ''}`;
}

async function getBitriseYml({
  signal,
  ...params
}: {
  appSlug: string;
  readFromRepo?: boolean;
  signal?: AbortSignal;
}): Promise<BitriseYml> {
  const response = await Client.get<string>(getBitriseYmlPath(params), {
    signal,
  });
  return toBitriseYml(response);
}

function updateBitriseYml({
  appSlug,
  model,
  signal,
}: {
  appSlug: string;
  model: BitriseYml;
  signal?: AbortSignal;
}): Promise<unknown> {
  return Client.post<unknown>(getBitriseYmlPath({ appSlug }), {
    signal,
    body: toJSON(model),
  });
}

export default {
  getBitriseYmlPath,
  getBitriseYml,
  getUpdateBitriseYmlPath: getBitriseYmlPath,
  updateBitriseYml,
};
