import { delay, http, HttpResponse } from 'msw';

import BitriseYmlApi, { WireGetConfigResponse, WireTreeNode } from '@/core/api/BitriseYmlApi';

const ROOT_NODE = {
  node_id: 'n_root',
  path: 'bitrise.yml',
  contents: 'format_version: "13"\ninclude:\n  - path: modules/workflows.yml\n',
  source: null,
  commit_sha: 'a1b2c3d4e5f6789012345678901234567890abcd',
  editable: true,
  includes: [
    {
      node_id: 'n_workflows',
      path: 'modules/workflows.yml',
      contents: 'workflows:\n  build:\n    steps:\n      - script@1: {}\n',
      source: { path: 'modules/workflows.yml', repository: null, branch: null, tag: null, commit: null },
      commit_sha: 'a1b2c3d4e5f6789012345678901234567890abcd',
      editable: true,
      includes: [],
    },
  ],
} satisfies WireTreeNode;

const MERGED_YML = 'format_version: "13"\nworkflows:\n  build:\n    steps:\n      - script@1: {}\n';

const MODULAR_RESPONSE = {
  root: ROOT_NODE,
  merged_yml: MERGED_YML,
  branch: 'main',
} satisfies WireGetConfigResponse;

const SINGLE_NODE_ROOT = {
  node_id: 'n_root',
  path: 'bitrise.yml',
  contents: 'format_version: "13"\nworkflows:\n  build:\n    steps:\n      - script@1: {}\n',
  source: null,
  commit_sha: 'a1b2c3d4e5f6789012345678901234567890abcd',
  editable: true,
  includes: [],
} satisfies WireTreeNode;

const SINGLE_NODE_RESPONSE = {
  root: SINGLE_NODE_ROOT,
  merged_yml: SINGLE_NODE_ROOT.contents,
  branch: 'main',
} satisfies WireGetConfigResponse;

export const getConfigTree = (variant: 'modular' | 'single_node' = 'modular', error?: string) => {
  return http.get(BitriseYmlApi.configTreePath({ projectSlug: ':slug' }), async () => {
    await delay();

    if (error) {
      return HttpResponse.json({ error_msg: error }, { status: 422 });
    }

    return HttpResponse.json(variant === 'modular' ? MODULAR_RESPONSE : SINGLE_NODE_RESPONSE, { status: 200 });
  });
};

export const postMergeConfig = (error?: string) => {
  return http.post(BitriseYmlApi.mergeConfigPath(':slug'), async () => {
    await delay();

    if (error) {
      return HttpResponse.json({ error_msg: error }, { status: 422 });
    }

    return HttpResponse.json({ merged_yml: MERGED_YML }, { status: 200 });
  });
};

export const treeMocks = { ROOT_NODE, MODULAR_RESPONSE, SINGLE_NODE_RESPONSE };
