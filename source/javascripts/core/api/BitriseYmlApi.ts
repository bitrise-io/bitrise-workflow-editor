import { GetConfigResponse, MergedConfigResult, TreeNode, TreeNodeSource } from '@/core/models/Tree';
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

const CONFIG_TREE_PATH = `/api/app/:projectSlug/config/tree`;
const CONFIG_MERGE_PATH = `/api/app/:projectSlug/config/merge`;

// Wire types are exported so MSW mock fixtures can `satisfies`-check against them.
export type WireTreeNodeSource = {
  path: string | null;
  repository: string | null;
  branch: string | null;
  tag: string | null;
  commit: string | null;
};

export type WireTreeNode = {
  node_id: string;
  path: string;
  contents: string;
  source: WireTreeNodeSource | null;
  commit_sha: string;
  editable: boolean;
  modified?: boolean;
  includes: WireTreeNode[];
};

export type WireEntityEntries = Record<string, Array<{ node_id: string }>>;

export type WireEntityIndex = {
  workflows: WireEntityEntries;
  pipelines: WireEntityEntries;
  step_bundles: WireEntityEntries;
  // Optional: absent on older BE responses, defaulted to `{}` on parse.
  containers?: WireEntityEntries;
  app_envs?: WireEntityEntries;
};

export type WireGetConfigResponse = {
  root: WireTreeNode;
  entity_index: WireEntityIndex;
  merged_yml?: string;
  branch?: string;
};

function fromWireSource(source: WireTreeNodeSource | null): TreeNodeSource | null {
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

function fromWireTreeNode(node: WireTreeNode): TreeNode {
  return {
    nodeId: node.node_id,
    path: node.path,
    contents: node.contents,
    source: fromWireSource(node.source),
    commitSha: node.commit_sha,
    editable: node.editable,
    modified: node.modified,
    includes: (node.includes ?? []).map(fromWireTreeNode),
  };
}

function toWireTreeNode(node: TreeNode, seen: Set<TreeNode> = new Set()): WireTreeNode {
  // Identity-based cycle guard: this builds the save/merge payload, so a cyclic
  // tree (an FE bug — wire payloads are JSON and can't contain cycles) must fail
  // loudly instead of silently dropping nodes or blowing the stack.
  if (seen.has(node)) {
    throw new Error(`Cycle detected in include tree at ${node.path}`);
  }
  seen.add(node);

  return {
    node_id: node.nodeId,
    path: node.path,
    contents: node.contents,
    source: node.source,
    commit_sha: node.commitSha,
    editable: node.editable,
    modified: node.modified,
    includes: node.includes.map((child) => toWireTreeNode(child, seen)),
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

function mergeConfigPath(projectSlug: string) {
  return CONFIG_MERGE_PATH.replace(':projectSlug', projectSlug);
}

type GetConfigOptions = {
  projectSlug: string;
  signal?: AbortSignal;
  forceToReadFromRepo?: boolean;
  branch?: string;
};

/** Bootstrap fetch. A non-modular config comes back as a single root node with no includes, so callers consume one shape. */
async function getConfig({ signal, ...options }: GetConfigOptions): Promise<GetConfigResponse> {
  const path = configTreePath(options);
  const response = await Client.raw(path, { signal, method: 'GET' });
  const wire = (await response.json()) as WireGetConfigResponse;
  const headerBranch = response.headers.get(CI_CONFIG_BRANCH_HEADER) || undefined;

  // The BE still ships `entity_index`, but the WFE ignores it and builds the index itself from the
  // file documents (single source of truth — see EntityIndexService). Left on the wire until the BE
  // stops emitting it.
  return {
    root: fromWireTreeNode(wire.root),
    mergedYml: wire.merged_yml,
    branch: wire.branch || headerBranch,
  };
}

type GetMergedConfigOptions = {
  projectSlug: string;
  tree: TreeNode;
  branch?: string;
  signal?: AbortSignal;
};

/** Flatten the current (possibly-edited) tree into a merged config. Posts live contents so the result reflects in-memory edits. */
async function getMergedConfig({
  projectSlug,
  tree,
  branch,
  signal,
}: GetMergedConfigOptions): Promise<MergedConfigResult> {
  const response = await Client.post<{ merged_yml: string }>(mergeConfigPath(projectSlug), {
    signal,
    body: JSON.stringify({ root: toWireTreeNode(tree), branch }),
  });

  return { mergedYml: response?.merged_yml ?? '' };
}

export type { GetCiConfigResult };

export default {
  getCiConfig,
  ciConfigPath,
  saveCiConfig,
  getConfig,
  configTreePath,
  mergeConfigPath,
  getMergedConfig,
  // Exposed so push-to-branch (`BranchesApi.pushBranch`, the canonical tree-save
  // path) can serialize a full tree to the wire shape. Deliberate cross-client
  // import: both clients speak the same wire shape, and one owner beats a copy.
  toWireTreeNode,
};
