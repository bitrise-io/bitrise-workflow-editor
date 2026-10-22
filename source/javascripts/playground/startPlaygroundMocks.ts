import { http, HttpResponse } from 'msw';
import { setupWorker } from 'msw/browser';
import { parse, stringify } from 'yaml';

import { getBranches } from '@/components/unified-editor/SwitchBranchDialog/SwitchBranchDialog.mswMocks';
import { WireGetConfigResponse, WireTreeNode } from '@/core/api/BitriseYmlApi';
import BuildApiMocks from '@/core/api/BuildApi.mswMocks';
import { getDefaultOutputs } from '@/core/api/EnvVarsApi.mswMocks';
import LicensePoolsApiMocks from '@/core/api/LicensePoolsApi.mswMocks';
import { getCertificates, getFileStorageDocuments, getProvProfiles, getSecrets } from '@/core/api/SecretApi.mswMocks';
import { getStacksAndMachines } from '@/core/api/StacksAndMachinesApi.mswMocks';
import StepApiMocks from '@/core/api/StepApi.mswMocks';
import ToolCatalogApiMocks from '@/core/api/ToolCatalogApi.mswMocks';

import sampleBitriseYml from '../../../spec/integration/test_bitrise.yml?raw';

// Prototype-only: lets the design playground (the Monolith Storybook) frame this app in website mode
// with no Monolith behind it. Only loaded when the dev server runs with VITE_PLAYGROUND=true.

// The playground's mock database (in the Monolith, our same-origin parent) owns each project's
// config, settings and branches; the sample config is only a fallback for running without it.
type PlaygroundBridge = {
  bitriseYml: (projectSlug: string) => string | undefined;
  latestRuns?: (projectSlug: string) => unknown;
  configTree: (projectSlug: string) => WireTreeNode | undefined;
  configSettings: (projectSlug: string) => { usesRepositoryYml: boolean; modularYamlSupported: boolean } | undefined;
  branches: (projectSlug: string) => string[] | undefined;
};
const bridge = () => (window.parent as Window & { playground?: PlaygroundBridge }).playground;

// The sample config pulls in local module files, which only resolve in CLI mode.
const fallbackYml = sampleBitriseYml.replace(/^include:\n(?:[ \t]+.*\n)+/m, '');

// Saves outlive the iframe (it reloads whenever the playground navigates back to the editor), so
// they're kept in sessionStorage per project: the round trip feels real until the tab is closed.
const savedYmlKey = (projectSlug: string) => `playground:bitrise.yml:${projectSlug}`;
const savedTreeKey = (projectSlug: string) => `playground:config-tree:${projectSlug}`;

const savedYml = (projectSlug: string) =>
  sessionStorage.getItem(savedYmlKey(projectSlug)) ?? bridge()?.bitriseYml(projectSlug) ?? fallbackYml;

const savedTree = (projectSlug: string): WireTreeNode => {
  const saved = sessionStorage.getItem(savedTreeKey(projectSlug));
  if (saved) return JSON.parse(saved) as WireTreeNode;
  // A non-modular config is a single root node with no includes, as the real endpoint returns it.
  return (
    bridge()?.configTree(projectSlug) ?? {
      node_id: 'n_root',
      path: 'bitrise.yml',
      contents: savedYml(projectSlug),
      source: null,
      commit_sha: '',
      editable: true,
      includes: [],
    }
  );
};

type YamlMap = Record<string, unknown>;
const isMap = (value: unknown): value is YamlMap =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const deepMerge = (base: YamlMap, layer: YamlMap): YamlMap => {
  const result = { ...base };
  Object.entries(layer).forEach(([key, value]) => {
    const current = result[key];
    result[key] = isMap(current) && isMap(value) ? deepMerge(current, value) : value;
  });
  return result;
};

// The Go merger's precedence: a file outranks the files it includes, and a later include outranks an
// earlier sibling. Maps merge key by key; anything else is replaced by the higher layer.
const mergeNode = (node: WireTreeNode): YamlMap => {
  const own = (parse(node.contents) ?? {}) as YamlMap;
  delete own.include;
  // Keep the file's own top-level order (format_version first) rather than its includes'.
  const ordered = Object.fromEntries(Object.keys(own).map((key) => [key, undefined]));
  const included = node.includes.reduce<YamlMap>((merged, child) => deepMerge(merged, mergeNode(child)), ordered);
  return deepMerge(included, own);
};

const mergedYml = (root: WireTreeNode) => stringify(mergeNode(root));

const withoutModifiedMarks = (node: WireTreeNode): WireTreeNode => ({
  ...node,
  modified: undefined,
  includes: node.includes.map(withoutModifiedMarks),
});

const fakeSha = () => Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

const handlers = [
  // Single-file configs (Bitrise-stored, or modular editing off).
  http.get('/api/app/:projectSlug/config.yml', ({ params }) =>
    HttpResponse.text(savedYml(String(params.projectSlug)), { headers: { 'Bitrise-Config-Version': '1' } }),
  ),
  http.post('/api/app/:projectSlug/config.yml', async ({ params, request }) => {
    const body = (await request.json()) as { app_config_datastore_yaml?: string };
    if (body.app_config_datastore_yaml) {
      sessionStorage.setItem(savedYmlKey(String(params.projectSlug)), body.app_config_datastore_yaml);
    }
    return HttpResponse.json({}, { headers: { 'Bitrise-Config-Version': '1' } });
  }),

  // Modular configs: the include tree, re-merging it as you edit, and saving by pushing to a branch.
  http.get('/api/app/:projectSlug/config/tree', ({ params, request }) => {
    const root = savedTree(String(params.projectSlug));
    const branch = new URL(request.url).searchParams.get('branch') ?? 'main';
    return HttpResponse.json({ root, merged_yml: mergedYml(root), branch } satisfies WireGetConfigResponse, {
      headers: { 'X-Config-Branch': branch },
    });
  }),
  http.post('/api/app/:projectSlug/config/merge', async ({ request }) => {
    const { root } = (await request.json()) as { root: WireTreeNode };
    return HttpResponse.json({ merged_yml: mergedYml(root) });
  }),
  http.post('/api/app/:projectSlug/config/push', async ({ params, request }) => {
    const projectSlug = String(params.projectSlug);
    const body = (await request.json()) as { root?: WireTreeNode; bitrise_yml?: string };
    if (body.root) {
      sessionStorage.setItem(savedTreeKey(projectSlug), JSON.stringify(withoutModifiedMarks(body.root)));
    } else if (body.bitrise_yml) {
      sessionStorage.setItem(savedYmlKey(projectSlug), body.bitrise_yml);
    }
    return HttpResponse.json({ status: 'ok', commit_sha: fakeSha() });
  }),

  // The proposed latest-runs endpoint, answered from the playground's database.
  http.get('/app/:projectSlug/latest_runs', ({ params }) =>
    HttpResponse.json(bridge()?.latestRuns?.(String(params.projectSlug)) ?? { pipelines: {}, workflows: {} }),
  ),
  http.get('/app/:projectSlug/pipeline_config', ({ params }) => {
    const projectSlug = String(params.projectSlug);
    const settings = bridge()?.configSettings(projectSlug);
    return HttpResponse.json({
      last_modified: null,
      lines: savedYml(projectSlug).split('\n').length,
      split: false,
      uses_repository_yml: settings?.usesRepositoryYml ?? false,
      modular_yaml_supported: settings?.modularYamlSupported ?? false,
      yml_root_path: null,
    });
  }),
  http.get('/app/:appSlug/git-branches', ({ params, request }) => {
    const branches = bridge()?.branches(String(params.appSlug));
    if (!branches) return undefined;
    const query = new URL(request.url).searchParams.get('q')?.toLowerCase() ?? '';
    return HttpResponse.json({ branches: branches.filter((name) => name.toLowerCase().includes(query)) });
  }),
  getBranches(),

  getSecrets(),
  getProvProfiles(),
  getCertificates(),
  getFileStorageDocuments(),
  getStacksAndMachines(),
  getDefaultOutputs(':appSlug'),
  StepApiMocks.getLocalStep({ status: 'success' }),
  LicensePoolsApiMocks.getWorkspaceLicensePools(),
  ToolCatalogApiMocks.getToolCatalog(),
  ToolCatalogApiMocks.getToolVersions(),
  BuildApiMocks.startBuild(),
];

const startPlaygroundMocks = async () => {
  const worker = setupWorker(...handlers);
  await worker.start({
    serviceWorker: {
      url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
      options: { scope: import.meta.env.BASE_URL },
    },
    // Step search (Algolia) and anything else not listed goes to the real network.
    onUnhandledFrame: 'bypass',
    quiet: true,
  });
};

export default startPlaygroundMocks;
