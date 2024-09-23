import { parse, stringify } from 'yaml';
import { BitriseYml } from '@/core/models/BitriseYml';
import Client from './client';

// TRANSFORMATIONS
function toBitriseYml(data: string): BitriseYml {
  return JSON.parse(data) as BitriseYml;
}

function toYml(model?: unknown): string {
  if (!model) {
    return '';
  }

  if (typeof model === 'string') {
    return model;
  }

  return `---\n${stringify(model, { version: '1.1', aliasDuplicateObjects: false })}`;
}

function toJSON(model?: unknown): string {
  return JSON.stringify({
    app_config_datastore_yaml: toYml(model),
  });
}

function fromYml(yml: string): unknown {
  if (!yml) {
    return {};
  }

  return parse(yml);
}

// API CALLS
const BITRISE_YML_PATH = `/api/app/:appSlug/config`;
const FORMAT_YML_PATH = `/api/cli/format`;

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

function formatYml(model: unknown): Promise<string> {
  return Client.post<string>(FORMAT_YML_PATH, {
    body: toJSON(model),
    headers: {
      Accept: 'application/x-yaml, application/json',
    },
  });
}

export default {
  getBitriseYmlPath,
  getBitriseYml,
  getUpdateBitriseYmlPath: getBitriseYmlPath,
  updateBitriseYml,
  formatYml,
  fromYml,
  toYml,
  toJSON,
};
