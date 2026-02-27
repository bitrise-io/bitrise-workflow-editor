import RuntimeUtils from '@/core/utils/RuntimeUtils';

import Client from './client';

export type ConfigFileTree = {
  path: string;
  contents: string;
  includes?: ConfigFileTree[];
  repository?: string;
  branch?: string;
  commit?: string;
  tag?: string;
};

type GetConfigFilesOptions = {
  projectSlug: string;
  signal?: AbortSignal;
};

type MergeConfigOptions = {
  projectSlug: string;
  tree: ConfigFileTree;
  signal?: AbortSignal;
};

type SaveConfigFilesOptions = {
  projectSlug: string;
  files: Array<{ path: string; contents: string }>;
  configTree?: ConfigFileTree;
};

const WEB_CONFIG_FILES_PATH = '/api/app/:projectSlug/config-files';
const LOCAL_CONFIG_FILES_PATH = '/api/config-files';
const LOCAL_MERGE_CONFIG_PATH = '/api/merge-config';
const WEB_MERGE_CONFIG_PATH = '/api/app/:projectSlug/merge-config';

function configFilesPath(projectSlug: string): string {
  return RuntimeUtils.isWebsiteMode()
    ? WEB_CONFIG_FILES_PATH.replace(':projectSlug', projectSlug)
    : LOCAL_CONFIG_FILES_PATH;
}

function mergeConfigPath(projectSlug: string): string {
  return RuntimeUtils.isWebsiteMode()
    ? WEB_MERGE_CONFIG_PATH.replace(':projectSlug', projectSlug)
    : LOCAL_MERGE_CONFIG_PATH;
}

async function getConfigFiles({ projectSlug, signal }: GetConfigFilesOptions): Promise<ConfigFileTree> {
  return Client.get<ConfigFileTree>(configFilesPath(projectSlug), { signal });
}

async function mergeConfig({ projectSlug, tree, signal }: MergeConfigOptions): Promise<string> {
  const response = await Client.raw(mergeConfigPath(projectSlug), {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/yaml,*/*',
    },
    body: JSON.stringify(tree),
  });

  return response.text();
}

async function saveConfigFiles({ projectSlug, files, configTree }: SaveConfigFilesOptions): Promise<void> {
  const path = configFilesPath(projectSlug);
  await Client.post(path, {
    body: JSON.stringify({ files, config_tree: configTree }),
  });
}

export default {
  configFilesPath,
  mergeConfigPath,
  getConfigFiles,
  mergeConfig,
  saveConfigFiles,
};
