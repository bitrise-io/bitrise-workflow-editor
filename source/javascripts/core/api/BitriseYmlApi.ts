import { map } from 'traverse';
import { cloneDeep } from 'es-toolkit';
import { parse, stringify } from 'yaml';
import { isEmpty } from 'es-toolkit/compat';

import { BitriseYml } from '@/core/models/BitriseYml';
import RuntimeUtils from '@/core/utils/RuntimeUtils';

import Client from './client';

// TRANSFORMATIONS
function toYml(model?: unknown): string {
  if (!model) {
    return '';
  }

  if (typeof model === 'string') {
    return model;
  }

  return `---\n${stringify(model, { version: '1.1', aliasDuplicateObjects: false })}`;
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

type SaveCiConfigOptions<T> = {
  data: T;
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

async function getCiConfig(options: GetCiConfigOptions & { format: 'json' }): Promise<BitriseYml>;
async function getCiConfig(options: GetCiConfigOptions & { format: 'yml' }): Promise<string>;
async function getCiConfig({ signal, ...options }: GetCiConfigOptions): Promise<BitriseYml | string> {
  const path = ciConfigPath(options);

  if (options.format === 'json') {
    return Client.get<BitriseYml>(path, { signal }).then(normalize);
  }

  return Client.text(path, { signal });
}

async function saveCiConfig(options: SaveCiConfigOptions<string>): Promise<void>;
async function saveCiConfig(options: SaveCiConfigOptions<BitriseYml>): Promise<void>;
async function saveCiConfig<T = never>({ data, tabOpenDuringSave, ...options }: SaveCiConfigOptions<T>) {
  const path = ciConfigPath({
    format: typeof data === 'string' ? 'yml' : 'json',
    ...options,
  });

  if (RuntimeUtils.isWebsiteMode()) {
    return Client.post(path, {
      body: JSON.stringify({
        app_config_datastore_yaml: data,
        tab_open_during_save: tabOpenDuringSave,
      }),
    });
  }

  return Client.post(path, {
    body: JSON.stringify({
      bitrise_yml: data,
    }),
  });
}

async function formatCiConfig(data: BitriseYml | string): Promise<string> {
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

export default {
  toYml,
  fromYml,
  getCiConfig,
  ciConfigPath,
  saveCiConfig,
  formatCiConfig,
};
