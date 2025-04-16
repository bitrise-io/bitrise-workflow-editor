import { parse, stringify } from 'yaml';

import { BitriseYml } from '@/core/models/BitriseYml';
import RuntimeUtils from '@/core/utils/RuntimeUtils';

import Client from './client';

const CI_CONFIG_VERSION_HEADER = 'Bitrise-Config-Version';

// TRANSFORMATIONS
function toYml(model?: unknown): string {
  if (!model) {
    return '';
  }

  if (typeof model === 'string') {
    return model;
  }

  return stringify(model, {
    version: '1.1',
    indentSeq: false,
    schema: 'yaml-1.1',
    aliasDuplicateObjects: false,
  });
}

function fromYml(yml: string): BitriseYml {
  if (!yml) {
    return { format_version: '' };
  }

  return parse(yml);
}

type GetCiConfigOptions = {
  projectSlug: string;
  signal?: AbortSignal;
  forceToReadFromRepo?: boolean;
};

type GetCiConfigResult = {
  ymlString: string;
  version: string;
};

type SaveCiConfigOptions = {
  data: string;
  version?: string;
  projectSlug: string;
  tabOpenDuringSave?: string;
};

// API CALLS
const FORMAT_YML_PATH = `/api/cli/format`;
const BITRISE_YML_PATH = `/api/app/:projectSlug/config.yml`;
const LOCAL_BITRISE_YML_PATH = `/api/bitrise-yml`;

function ciConfigPath({ projectSlug, forceToReadFromRepo }: Omit<GetCiConfigOptions, 'signal'>) {
  const basePath = RuntimeUtils.isWebsiteMode()
    ? BITRISE_YML_PATH.replace(':projectSlug', projectSlug)
    : LOCAL_BITRISE_YML_PATH;

  return [basePath, forceToReadFromRepo ? '?is_force_from_repo=1' : ''].join('');
}

async function getCiConfig({ signal, ...options }: GetCiConfigOptions): Promise<GetCiConfigResult> {
  const path = ciConfigPath(options);
  const response = await Client.raw(path, { signal, method: 'GET' });

  return {
    ymlString: await response.text(),
    version: response.headers.get(CI_CONFIG_VERSION_HEADER) || '',
  };
}

async function saveCiConfig({ data, version, tabOpenDuringSave, projectSlug }: SaveCiConfigOptions) {
  const path = ciConfigPath({ projectSlug });
  const headers: HeadersInit = version ? { [CI_CONFIG_VERSION_HEADER]: version } : {};

  if (RuntimeUtils.isWebsiteMode()) {
    return Client.post(path, {
      headers,
      body: JSON.stringify({
        app_config_datastore_yaml: data,
        tab_open_during_save: tabOpenDuringSave,
      }),
    });
  }

  return Client.post(path, {
    headers,
    body: JSON.stringify({
      bitrise_yml: data,
    }),
  });
}

async function formatCiConfig(data: string, signal?: AbortSignal): Promise<string> {
  const response = await Client.text(FORMAT_YML_PATH, {
    signal,
    body: JSON.stringify({
      app_config_datastore_yaml: data,
    }),
    headers: {
      Accept: 'application/x-yaml, application/json',
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  return response || toYml(data);
}

export type { GetCiConfigResult };

export default {
  toYml,
  fromYml,
  getCiConfig,
  ciConfigPath,
  saveCiConfig,
  formatCiConfig,
};
