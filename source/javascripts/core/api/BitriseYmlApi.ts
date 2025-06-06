import RuntimeUtils from '@/core/utils/RuntimeUtils';

import Client from './client';

const CI_CONFIG_VERSION_HEADER = 'Bitrise-Config-Version';

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

export type { GetCiConfigResult };

export default {
  getCiConfig,
  ciConfigPath,
  saveCiConfig,
};
