import { parse, stringify } from 'yaml';
import { BitriseYml } from '@/core/models/BitriseYml';
import RuntimeUtils from '@/core/utils/RuntimeUtils'; // TRANSFORMATIONS
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
const BITRISE_YML_PATH = `/api/app/:projectSlug/config`;
const LOCAL_BITRISE_YAML_PATH = `/api/bitrise-yml.json`;
const FORMAT_YML_PATH = `/api/cli/format`;

function getBitriseYmlPath({
  projectSlug,
  readFromRepo = false,
}: {
  projectSlug: string;
  readFromRepo?: boolean;
}): string {
  return `${BITRISE_YML_PATH.replace(':projectSlug', projectSlug)}${readFromRepo ? '?is_force_from_repo=1' : ''}`;
}

async function getBitriseYml({
  signal,
  ...params
}: {
  projectSlug: string;
  readFromRepo?: boolean;
  signal?: AbortSignal;
}): Promise<BitriseYml> {
  if (RuntimeUtils.isWebsiteMode()) {
    const response = await Client.text(getBitriseYmlPath(params), {
      signal,
    });
    return toBitriseYml(response);
  }

  return Client.text(LOCAL_BITRISE_YAML_PATH).then(toBitriseYml);
}

function updateBitriseYml({
  projectSlug,
  model,
  signal,
}: {
  projectSlug: string;
  model: BitriseYml;
  signal?: AbortSignal;
}): Promise<unknown> {
  return Client.post<unknown>(getBitriseYmlPath({ projectSlug }), {
    signal,
    body: toJSON(model),
  });
}

async function formatYml(model: BitriseYml): Promise<string> {
  const response = await Client.text(FORMAT_YML_PATH, {
    body: toJSON(model),
    headers: {
      Accept: 'application/x-yaml, application/json',
    },
    method: 'POST',
  });

  // NOTE: The API returns a JSON object if the input is invalid
  try {
    JSON.parse(response);
    return toYml(model);
  } catch {
    return response || '';
  }
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
