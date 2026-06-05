import {
  EntityIndex,
  GetConfigResponse,
  MergedConfigResult,
  SaveTreeConflict,
  SaveTreeResult,
  TreeNode,
  TreeNodeSource,
} from '@/core/models/Tree';
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

// --- Modular YAML tree endpoints ---

const CONFIG_TREE_PATH = `/api/app/:projectSlug/config/tree`;
const CONFIG_MERGE_PATH = `/api/app/:projectSlug/config/merge`;
const CONFIG_PUSH_PATH = `/api/app/:projectSlug/config/push`;

type WireTreeNodeSource = {
  path: string | null;
  repository: string | null;
  branch: string | null;
  tag: string | null;
  commit: string | null;
};

type WireTreeNode = {
  node_id: string;
  path: string;
  contents: string;
  source: WireTreeNodeSource | null;
  commit_sha: string;
  editable: boolean;
  modified?: boolean;
  includes: WireTreeNode[];
};

type WireEntityEntries = Record<string, Array<{ node_id: string }>>;

type WireEntityIndex = {
  workflows: WireEntityEntries;
  pipelines: WireEntityEntries;
  step_bundles: WireEntityEntries;
};

type WireGetConfigResponse = {
  root: WireTreeNode;
  entity_index: WireEntityIndex;
  merged_yml?: string;
  branch?: string;
};

type WireSaveTreeResponse = {
  status: 'ok';
  warnings?: string[];
  root: WireTreeNode;
  entity_index: WireEntityIndex;
};

type WireSaveTreeConflict = {
  status: 'conflict';
  conflicts: Array<{ path: string; remote: WireTreeNode }>;
};

function mapSource(source: WireTreeNodeSource | null): TreeNodeSource | null {
  if (!source) {
    return null;
  }
  return {
    path: source.path ?? null,
    repository: source.repository ?? null,
    branch: source.branch ?? null,
    tag: source.tag ?? null,
    commit: source.commit ?? null,
  };
}

function wireToTreeNode(node: WireTreeNode): TreeNode {
  return {
    nodeId: node.node_id,
    path: node.path,
    contents: node.contents,
    source: mapSource(node.source),
    commitSha: node.commit_sha,
    editable: node.editable,
    modified: node.modified,
    includes: (node.includes ?? []).map(wireToTreeNode),
  };
}

function treeNodeToWire(node: TreeNode): WireTreeNode {
  return {
    node_id: node.nodeId,
    path: node.path,
    contents: node.contents,
    source: node.source,
    commit_sha: node.commitSha,
    editable: node.editable,
    modified: node.modified,
    includes: node.includes.map(treeNodeToWire),
  };
}

function mapEntityEntries(entries: WireEntityEntries = {}): EntityIndex['workflows'] {
  return Object.fromEntries(
    Object.entries(entries).map(([id, defs]) => [id, defs.map(({ node_id }) => ({ nodeId: node_id }))]),
  );
}

function wireToEntityIndex(index: WireEntityIndex): EntityIndex {
  return {
    workflows: mapEntityEntries(index.workflows),
    pipelines: mapEntityEntries(index.pipelines),
    stepBundles: mapEntityEntries(index.step_bundles),
  };
}

function configTreePath({
  projectSlug,
  forceToReadFromRepo,
  branch,
}: {
  projectSlug: string;
  forceToReadFromRepo?: boolean;
  branch?: string;
}) {
  const basePath = CONFIG_TREE_PATH.replace(':projectSlug', projectSlug);

  const queryParams = new URLSearchParams();
  if (forceToReadFromRepo) {
    queryParams.append('is_force_from_repo', '1');
  }
  if (branch) {
    queryParams.append('branch', branch);
  }

  return [basePath, queryParams.toString()].filter(Boolean).join('?');
}

type GetConfigOptions = {
  projectSlug: string;
  signal?: AbortSignal;
  forceToReadFromRepo?: boolean;
  branch?: string;
};

/**
 * Bootstrap fetch. Always returns the tree-shaped config — a non-modular config
 * comes back as a single root node with no includes, so callers consume one
 * shape regardless of whether the project uses modular YAML.
 */
async function getConfig({ signal, ...options }: GetConfigOptions): Promise<GetConfigResponse> {
  const path = configTreePath(options);
  const response = await Client.raw(path, { signal, method: 'GET' });
  const wire = (await response.json()) as WireGetConfigResponse;
  const headerBranch = response.headers.get(CI_CONFIG_BRANCH_HEADER) || undefined;

  return {
    root: wireToTreeNode(wire.root),
    entityIndex: wireToEntityIndex(wire.entity_index),
    mergedYml: wire.merged_yml,
    branch: wire.branch || headerBranch,
  };
}

/**
 * Flatten the editor's current (possibly-edited) tree into a single merged
 * config. The full tree is posted with live contents, so the result reflects
 * in-memory edits. `branch` keeps the reconstructed include keys aligned with
 * how the tree was loaded.
 */
async function getMergedConfig({
  projectSlug,
  tree,
  branch,
  signal,
}: {
  projectSlug: string;
  tree: TreeNode;
  branch?: string;
  signal?: AbortSignal;
}): Promise<MergedConfigResult> {
  const path = CONFIG_MERGE_PATH.replace(':projectSlug', projectSlug);
  const response = await Client.post<{ merged_yml: string }>(path, {
    signal,
    body: JSON.stringify({ root: treeNodeToWire(tree), branch }),
  });

  return { mergedYml: response?.merged_yml ?? '' };
}

/**
 * Save the full tree (every node, including read-only ones for staleness
 * detection). On success returns the refreshed tree + index. A 409 conflict is
 * thrown as a `ClientError`; callers read `mapSaveConflict(error.data)`.
 */
async function pushConfigTree({
  projectSlug,
  tree,
  tabOpenDuringSave,
  conversationId,
}: {
  projectSlug: string;
  tree: TreeNode;
  tabOpenDuringSave?: string;
  conversationId?: string;
}): Promise<SaveTreeResult> {
  const path = CONFIG_PUSH_PATH.replace(':projectSlug', projectSlug);
  const response = await Client.post<WireSaveTreeResponse>(path, {
    body: JSON.stringify({
      root: treeNodeToWire(tree),
      tab_open_during_save: tabOpenDuringSave,
      conversation_id: conversationId,
    }),
  });

  if (!response) {
    throw new Error('Empty response from config push');
  }

  return {
    status: 'ok',
    warnings: response.warnings ?? [],
    root: wireToTreeNode(response.root),
    entityIndex: wireToEntityIndex(response.entity_index),
  };
}

/**
 * Map a 409 conflict body (carried on `ClientError.data`) to the camelCase
 * conflict shape, or `undefined` if the payload isn't a tree conflict.
 */
function mapSaveConflict(data?: Record<string, unknown>): SaveTreeConflict | undefined {
  if (!data || data.status !== 'conflict' || !Array.isArray(data.conflicts)) {
    return undefined;
  }

  const conflicts = (data as unknown as WireSaveTreeConflict).conflicts;
  return {
    status: 'conflict',
    conflicts: conflicts.map(({ path, remote }) => ({ path, remote: wireToTreeNode(remote) })),
  };
}

export type { GetCiConfigResult };

export default {
  getCiConfig,
  ciConfigPath,
  saveCiConfig,
  getConfig,
  configTreePath,
  getMergedConfig,
  pushConfigTree,
  mapSaveConflict,
  // Exposed so the push-to-branch flow can serialize a full tree to the wire shape.
  treeNodeToWire,
};
