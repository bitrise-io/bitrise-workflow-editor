import RuntimeUtils from '@/core/utils/RuntimeUtils';

import Client from './client';

const CI_CONFIG_VERSION_HEADER = 'Bitrise-Config-Version';
const CI_CONFIG_BRANCH_HEADER = 'X-Config-Branch';
const CI_CONFIG_COMMIT_SHA_HEADER = 'X-Config-Commit-SHA';

type GetCiConfigOptions = {
  projectSlug: string;
  signal?: AbortSignal;
  forceToReadFromRepo?: boolean;
  skipValidation?: boolean;
  branch?: string;
};

type GetCiConfigResult = {
  ymlString: string;
  version: string;
  branch?: string;
  commitSha?: string;
};

type SaveCiConfigOptions = {
  data: string;
  version?: string;
  projectSlug: string;
  tabOpenDuringSave?: string;
  conversationId?: string;
};

// API CALLS
const BITRISE_YML_PATH = `/api/app/:projectSlug/config.yml`;
const LOCAL_BITRISE_YML_PATH = `/api/bitrise-yml`;

function ciConfigPath({
  projectSlug,
  forceToReadFromRepo,
  skipValidation,
  branch,
}: Omit<GetCiConfigOptions, 'signal'>) {
  const basePath = RuntimeUtils.isWebsiteMode()
    ? BITRISE_YML_PATH.replace(':projectSlug', projectSlug)
    : LOCAL_BITRISE_YML_PATH;

  const queryParams = new URLSearchParams();
  if (forceToReadFromRepo) {
    queryParams.append('is_force_from_repo', '1');
  }
  if (skipValidation) {
    queryParams.append('skip_validation', '1');
  }
  if (branch) {
    queryParams.append('branch', branch);
  }

  return [basePath, queryParams.toString()].filter(Boolean).join('?');
}

async function getCiConfig({ signal, ...options }: GetCiConfigOptions): Promise<GetCiConfigResult> {
  const path = ciConfigPath(options);
  const response = await Client.raw(path, { signal, method: 'GET' });

  return {
    ymlString: await response.text(),
    version: response.headers.get(CI_CONFIG_VERSION_HEADER) || '',
    branch: response.headers.get(CI_CONFIG_BRANCH_HEADER) || '',
    commitSha: response.headers.get(CI_CONFIG_COMMIT_SHA_HEADER) || '',
  };
}

async function saveCiConfig({ data, version, tabOpenDuringSave, projectSlug, conversationId }: SaveCiConfigOptions) {
  const path = ciConfigPath({ projectSlug });
  const headers: HeadersInit = version ? { [CI_CONFIG_VERSION_HEADER]: version } : {};

  if (RuntimeUtils.isWebsiteMode()) {
    return Client.post(path, {
      headers,
      body: JSON.stringify({
        app_config_datastore_yaml: data,
        tab_open_during_save: tabOpenDuringSave,
        conversation_id: conversationId,
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
