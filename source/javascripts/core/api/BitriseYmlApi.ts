import { map } from 'traverse';
import { cloneDeep } from 'es-toolkit';
import { parse, stringify } from 'yaml';
import { isEmpty } from 'es-toolkit/compat';

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
    aliasDuplicateObjects: false,
    indentSeq: false,
  });
}

function fromYml(yml: string): unknown {
  if (!yml) {
    return {};
  }

  return parse(yml);
}

function normalize(yml: BitriseYml): BitriseYml {
  return map(cloneDeep(yml), function walker(value) {
    if (['opts', 'run_if', 'triggers', 'credentials'].includes(this.key || '') && isEmpty(value)) {
      this.delete();
    }
  });
}

type GetCiConfigOptions = {
  format: 'yml' | 'json';
  projectSlug: string;
  signal?: AbortSignal;
  forceToReadFromRepo?: boolean;
};

type GetCiConfigResultYml = {
  data: string;
  version: string;
};

type GetCiConfigResultJson = {
  data: BitriseYml;
  version: string;
};

type SaveCiConfigOptions<T> = {
  data: T;
  version?: string;
  projectSlug: string;
  tabOpenDuringSave?: string;
};

// API CALLS
const FORMAT_YML_PATH = `/api/cli/format`;
const BITRISE_YML_PATH = `/api/app/:projectSlug/config:format`;
const LOCAL_BITRISE_YML_PATH = `/api/bitrise-yml:format`;

function ciConfigPath({ format, projectSlug, forceToReadFromRepo }: Omit<GetCiConfigOptions, 'signal'>) {
  const basePath = RuntimeUtils.isWebsiteMode()
    ? BITRISE_YML_PATH.replace(':projectSlug', projectSlug).replace(':format', `.${format}`)
    : LOCAL_BITRISE_YML_PATH.replace(':format', format === 'yml' ? '' : `.${format}`);

  return [basePath, forceToReadFromRepo ? '?is_force_from_repo=1' : ''].join('');
}

async function getCiConfig(options: GetCiConfigOptions & { format: 'json' }): Promise<GetCiConfigResultJson>;
async function getCiConfig(options: GetCiConfigOptions & { format: 'yml' }): Promise<GetCiConfigResultYml>;
async function getCiConfig({
  signal,
  ...options
}: GetCiConfigOptions): Promise<GetCiConfigResultJson | GetCiConfigResultYml> {
  const path = ciConfigPath(options);
  const response = await Client.raw(path, { signal, method: 'GET' });

  if (options.format === 'json') {
    return {
      data: normalize(await response.json()),
      version: response.headers.get(CI_CONFIG_VERSION_HEADER) || '',
    };
  }

  return {
    data: await response.text(),
    version: response.headers.get(CI_CONFIG_VERSION_HEADER) || '',
  };
}

async function saveCiConfig(options: SaveCiConfigOptions<string>): Promise<void>;
async function saveCiConfig(options: SaveCiConfigOptions<BitriseYml>): Promise<void>;
async function saveCiConfig<T = never>({ data, version, tabOpenDuringSave, ...options }: SaveCiConfigOptions<T>) {
  const path = ciConfigPath({
    format: typeof data === 'string' ? 'yml' : 'json',
    ...options,
  });

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

async function formatCiConfig(data: string): Promise<string> {
  const response = await Client.text(FORMAT_YML_PATH, {
    body: JSON.stringify({
      app_config_datastore_yaml: data,
    }),
    headers: {
      Accept: 'application/x-yaml, application/json',
    },
    method: 'POST',
  });

  return response || toYml(data);
}

export type { GetCiConfigResultJson, GetCiConfigResultYml };

export default {
  toYml,
  fromYml,
  getCiConfig,
  ciConfigPath,
  saveCiConfig,
  formatCiConfig,
};
