import { delay, http, HttpResponse } from 'msw';

import BitriseYmlApi from '@/core/api/BitriseYmlApi';

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
};

const ENTITY_INDEX = {
  workflows: { build: [{ node_id: 'n_workflows' }] },
  pipelines: {},
  step_bundles: {},
};

const MERGED_YML = 'format_version: "13"\nworkflows:\n  build:\n    steps:\n      - script@1: {}\n';

const MODULAR_RESPONSE = {
  root: ROOT_NODE,
  entity_index: ENTITY_INDEX,
  merged_yml: MERGED_YML,
  branch: 'main',
};

const SINGLE_NODE_ROOT = {
  node_id: 'n_root',
  path: 'bitrise.yml',
  contents: 'format_version: "13"\nworkflows:\n  build:\n    steps:\n      - script@1: {}\n',
  source: null,
  commit_sha: 'a1b2c3d4e5f6789012345678901234567890abcd',
  editable: true,
  includes: [],
};

const SINGLE_NODE_RESPONSE = {
  root: SINGLE_NODE_ROOT,
  entity_index: { workflows: { build: [{ node_id: 'n_root' }] }, pipelines: {}, step_bundles: {} },
  merged_yml: SINGLE_NODE_ROOT.contents,
  branch: 'main',
};

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
  return http.post('/api/app/:slug/config/merge', async () => {
    await delay();

    if (error) {
      return HttpResponse.json({ error_msg: error }, { status: 422 });
    }

    return HttpResponse.json({ merged_yml: MERGED_YML }, { status: 200 });
  });
};

export const treeMocks = { ROOT_NODE, ENTITY_INDEX, MODULAR_RESPONSE, SINGLE_NODE_RESPONSE };
