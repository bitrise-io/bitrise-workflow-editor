/* eslint-disable @typescript-eslint/naming-convention */
import { Document } from 'yaml';
import { createStore, ExtractState, StoreApi } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import { BitriseYml } from '../models/BitriseYml';
import { emptyEntityIndex, EntityIndex, TreeNode, TreeNodeSource } from '../models/Tree';
import EntityIndexService from '../services/EntityIndexService';
import TreeService from '../services/TreeService';
import RuntimeUtils from '../utils/RuntimeUtils';
import YmlUtils from '../utils/YmlUtils';

export type BitriseYmlStore = StoreApi<BitriseYmlStoreState>;
export type BitriseYmlStoreState = ExtractState<typeof bitriseYmlStore>;

export type YamlMutator = (ctx: YamlMutatorCtx) => Document;
export type YamlMutatorCtx = { doc: Document };

/** Per-file editing state in the modular tree, keyed by `node_id`. */
export type FileSlice = {
  nodeId: string;
  path: string;
  source: TreeNodeSource | null;
  commitSha: string;
  editable: boolean;
  ymlDocument: Document;
  savedYmlDocument: Document;
};

export type OpenTab = {
  nodeId: string;
  isPreview: boolean;
  /** Router location seen while this tab was active, so re-selecting it restores that page. */
  lastLocation?: string;
};

/** Reserved id for the always-present Merged Config tab (no `n_` prefix ⇒ can't collide with a BE id). */
export const MERGED_CONFIG_NODE_ID = '__merged_config__';

export const bitriseYmlStore = createStore(
  subscribeWithSelector(() => ({
    version: '',
    yml: {} as BitriseYml,
    hasChanges: false,
    discardKey: Date.now(),
    ymlDocument: new Document(),
    savedYmlDocument: new Document(),
    __invalidYmlString: undefined as string | undefined,
    __savedInvalidYmlString: undefined as string | undefined,
    validationStatus: 'valid' as 'valid' | 'invalid' | 'warnings',
    configBranch: undefined as string | undefined,
    configCommitSha: undefined as string | undefined,

    // Modular YAML tree state. `tree` is the structural skeleton (for traversal);
    // `files` is the source of truth for live contents.
    tree: undefined as TreeNode | undefined,
    files: {} as Record<string, FileSlice>,
    entityIndex: emptyEntityIndex(),
    selectedNodeId: undefined as string | undefined,
    openTabs: [] as OpenTab[],
    // The merged tab lives outside `openTabs`, so its page memory is held here.
    mergedTabLastLocation: undefined as string | undefined,
    mergedYml: undefined as string | undefined,
    mergedYmlStale: true,
    // Merged config of the saved files — baseline for the merged-tab diff. Frozen while edits are pending.
    savedMergedYml: undefined as string | undefined,
  })),
);

export function getBitriseYml() {
  return bitriseYmlStore.getState().yml;
}

function warnInDev(message: string) {
  let isProduction = false;
  try {
    isProduction = RuntimeUtils.isProduction();
  } catch {
    // window.env is absent outside the browser (e.g. unit tests) — treat as non-production.
    isProduction = false;
  }

  if (!isProduction) {
    // eslint-disable-next-line no-console
    console.warn(message);
  }
}

export function getYmlString(from?: 'savedYmlDocument'): string {
  const { __invalidYmlString, __savedInvalidYmlString, savedYmlDocument, ymlDocument } = bitriseYmlStore.getState();

  if (from === 'savedYmlDocument') {
    return __savedInvalidYmlString ?? YmlUtils.toYml(savedYmlDocument);
  }

  return __invalidYmlString ?? YmlUtils.toYml(ymlDocument);
}

export function forceRefreshStates() {
  bitriseYmlStore.setState({
    discardKey: Date.now(),
  });
}

export function setValidationStatus(status: 'valid' | 'invalid' | 'warnings') {
  bitriseYmlStore.setState({ validationStatus: status });
}

export function discardBitriseYmlDocument() {
  const state = bitriseYmlStore.getState();

  if (!state.tree) {
    bitriseYmlStore.setState({
      discardKey: Date.now(),
      ymlDocument: state.savedYmlDocument.clone(),
      __invalidYmlString: state.__savedInvalidYmlString,
    });
    return;
  }

  // Drop session-created files entirely (editable + empty commitSha ⇒ never on the branch,
  // so there's nothing to revert to); revert the rest to their saved document.
  const dropIds = new Set(
    Object.values(state.files)
      .filter((slice) => slice.editable && !slice.commitSha)
      .map((slice) => slice.nodeId),
  );

  const files: Record<string, FileSlice> = {};
  Object.values(state.files).forEach((slice) => {
    if (dropIds.has(slice.nodeId)) {
      return;
    }
    files[slice.nodeId] = { ...slice, ymlDocument: slice.savedYmlDocument };
  });

  const tree = state.tree ? pruneNodes(state.tree, dropIds) : state.tree;
  const openTabs = state.openTabs.filter((tab) => !dropIds.has(tab.nodeId));

  // If the active tab was dropped, fall back to a remaining tab (else merged config).
  const activeDropped = !!state.selectedNodeId && dropIds.has(state.selectedNodeId);
  let selectionPatch: ReturnType<typeof mergedConfigPatch> | ReturnType<typeof activeFilePatch>;
  if (activeDropped) {
    const neighborNodeId = openTabs[openTabs.length - 1]?.nodeId;
    const neighbor = neighborNodeId ? files[neighborNodeId] : undefined;
    selectionPatch = neighbor
      ? {
          selectedNodeId: neighbor.nodeId,
          version: '',
          ymlDocument: neighbor.savedYmlDocument,
          savedYmlDocument: neighbor.savedYmlDocument,
          __invalidYmlString: undefined,
        }
      : mergedConfigPatch();
  } else {
    const activeSlice = state.selectedNodeId ? files[state.selectedNodeId] : undefined;
    selectionPatch = {
      selectedNodeId: state.selectedNodeId ?? MERGED_CONFIG_NODE_ID,
      version: '',
      ymlDocument: activeSlice ? activeSlice.savedYmlDocument : state.savedYmlDocument,
      savedYmlDocument: activeSlice ? activeSlice.savedYmlDocument : state.savedYmlDocument,
      __invalidYmlString: undefined,
    };
  }

  bitriseYmlStore.setState({
    discardKey: Date.now(),
    files,
    tree,
    openTabs,
    ...selectionPatch,
    mergedYmlStale: true,
  });
}

export function updateBitriseYmlDocumentByString(ymlString: string) {
  const state = bitriseYmlStore.getState();
  const doc = YmlUtils.toDoc(ymlString);

  if (!state.tree) {
    if (doc.errors.length === 0) {
      bitriseYmlStore.setState({ ymlDocument: doc, __invalidYmlString: undefined });
    } else {
      bitriseYmlStore.setState({ __invalidYmlString: ymlString });
    }
    return;
  }

  const nodeId = state.selectedNodeId;
  const slice = nodeId ? state.files[nodeId] : undefined;
  if (!nodeId || !slice || !slice.editable) {
    warnInDev(`updateBitriseYmlDocumentByString: active file is read-only or missing; edit ignored`);
    return;
  }

  if (doc.errors.length === 0) {
    bitriseYmlStore.setState({
      ymlDocument: doc,
      __invalidYmlString: undefined,
      files: { ...state.files, [nodeId]: { ...slice, ymlDocument: doc } },
      mergedYmlStale: true,
    });
  } else {
    bitriseYmlStore.setState({ __invalidYmlString: ymlString });
  }
}

export function initializeBitriseYmlDocument({
  ymlString,
  version,
  branch,
  commitSha,
}: {
  ymlString: string;
  version: string;
  branch?: string;
  commitSha?: string;
}) {
  const doc = YmlUtils.toDoc(ymlString);

  if (doc.errors.length === 0) {
    bitriseYmlStore.setState({
      version,
      ymlDocument: doc,
      savedYmlDocument: doc,
      __invalidYmlString: undefined,
      __savedInvalidYmlString: undefined,
      configBranch: branch || undefined,
      configCommitSha: commitSha || undefined,
    });
  } else {
    bitriseYmlStore.setState({
      version,
      __invalidYmlString: ymlString,
      __savedInvalidYmlString: ymlString,
      configBranch: branch || undefined,
      configCommitSha: commitSha || undefined,
    });
  }
}

export function updateBitriseYmlDocument(mutator: YamlMutator) {
  const state = bitriseYmlStore.getState();

  if (!state.tree) {
    bitriseYmlStore.setState({
      ymlDocument: mutator({ doc: state.ymlDocument.clone() }),
      __invalidYmlString: undefined,
    });
    return;
  }

  // Modular mode: the active tab's file IS the document the whole WFE edits.
  // Read-only (cross-ref) files no-op (defense-in-depth — UI should already gate this).
  const nodeId = state.selectedNodeId;
  const slice = nodeId ? state.files[nodeId] : undefined;

  if (!nodeId || !slice) {
    warnInDev(`updateBitriseYmlDocument: no editable file is active (selected "${nodeId}"); mutation ignored`);
    return;
  }
  if (!slice.editable) {
    warnInDev(`updateBitriseYmlDocument: file "${slice.path}" is read-only; mutation ignored`);
    return;
  }

  const nextDoc = mutator({ doc: state.ymlDocument.clone() });
  bitriseYmlStore.setState({
    ymlDocument: nextDoc,
    __invalidYmlString: undefined,
    files: { ...state.files, [nodeId]: { ...slice, ymlDocument: nextDoc } },
    mergedYmlStale: true,
  });
}

export function isFileDirty(slice?: FileSlice) {
  if (!slice) {
    return false;
  }
  // An editable file with no commitSha was created in-editor (not yet on the branch) ⇒ always dirty.
  return (slice.editable && !slice.commitSha) || !YmlUtils.isEquals(slice.ymlDocument, slice.savedYmlDocument);
}

/** State patch binding a file's slice as the single active `ymlDocument` the whole WFE reads/writes. */
function activeFilePatch(nodeId: string) {
  const slice = bitriseYmlStore.getState().files[nodeId];
  if (!slice) {
    warnInDev(`activeFile: no file with node_id "${nodeId}"`);
    return null;
  }
  return {
    selectedNodeId: nodeId,
    // `version` is unused in modular mode (conflict detection keys off commit_sha).
    version: '',
    ymlDocument: slice.ymlDocument,
    savedYmlDocument: slice.savedYmlDocument,
    __invalidYmlString: undefined,
  };
}

function buildFileSlices(root: TreeNode): Record<string, FileSlice> {
  const files: Record<string, FileSlice> = {};

  TreeService.walk(root, (node) => {
    const doc = YmlUtils.toDoc(node.contents);
    files[node.nodeId] = {
      nodeId: node.nodeId,
      path: node.path,
      source: node.source,
      commitSha: node.commitSha,
      editable: node.editable,
      ymlDocument: doc,
      // Same object as ymlDocument until the first edit clones it ⇒ isEquals ⇒ not dirty.
      savedYmlDocument: doc,
    };
  });

  return files;
}

export function getFileSlice(nodeId: string): FileSlice | undefined {
  return bitriseYmlStore.getState().files[nodeId];
}

export function getFileYmlString(nodeId: string): string {
  const slice = bitriseYmlStore.getState().files[nodeId];
  return slice ? YmlUtils.toYml(slice.ymlDocument) : '';
}

/** Build a wire-ready tree from live file state (every node), for the save / merged-config payloads. */
export function getModularConfigTree(): TreeNode | undefined {
  const { tree, files } = bitriseYmlStore.getState();
  if (!tree) {
    return undefined;
  }

  const live: Record<string, { contents: string; modified: boolean }> = {};
  Object.values(files).forEach((slice) => {
    live[slice.nodeId] = {
      contents: YmlUtils.toYml(slice.ymlDocument),
      // A never-saved file (empty commitSha) is always modified so the push creates it.
      modified: !slice.commitSha || !YmlUtils.isEquals(slice.ymlDocument, slice.savedYmlDocument),
    };
  });

  return TreeService.serializeTree(tree, live);
}

function normalizeFilePath(raw: string): string {
  return raw
    .trim()
    .replace(/^\/+|\/+$/g, '')
    .replace(/\/{2,}/g, '/');
}

/** Session-stable opaque `node_id` for an FE-created file (djb2 of its path); the BE re-derives real ids on reload. */
function localNodeId(path: string): string {
  let h = 5381;
  for (let i = 0; i < path.length; i += 1) {
    h = (h * 33) ^ path.charCodeAt(i);
  }
  return `n_new_${(h >>> 0).toString(16)}`;
}

export type CreateFileResult = { ok: true; nodeId: string } | { ok: false; error: string };

/** Deep clone of `root` with `child` appended under `parentNodeId` (or the root if not found); siblings keep identity. */
function insertChild(root: TreeNode, parentNodeId: string, child: TreeNode): TreeNode {
  if (root.nodeId === parentNodeId) {
    return { ...root, includes: [...root.includes, child] };
  }
  return { ...root, includes: root.includes.map((node) => insertChild(node, parentNodeId, child)) };
}

/** Clone of `root` with every node in `dropIds` removed recursively. The root itself is never dropped. */
function pruneNodes(root: TreeNode, dropIds: Set<string>): TreeNode {
  return {
    ...root,
    includes: root.includes.filter((child) => !dropIds.has(child.nodeId)).map((child) => pruneNodes(child, dropIds)),
  };
}

/**
 * Create a new, empty module file at `rawPath` and open it in a tab. Added under `parentNodeId`
 * (the module that will `include:` it) so the backend reconciler matches it instead of fetching from Git.
 */
export function createFile(rawPath: string, parentNodeId?: string): CreateFileResult {
  const { tree, files } = bitriseYmlStore.getState();
  if (!tree) {
    return { ok: false, error: 'No modular configuration is loaded.' };
  }

  const path = normalizeFilePath(rawPath);
  if (!path) {
    return { ok: false, error: 'Enter a file path.' };
  }
  if (!/\.ya?ml$/i.test(path)) {
    return { ok: false, error: 'The path must end in .yml or .yaml.' };
  }
  if (Object.values(files).some((file) => file.path === path)) {
    return { ok: false, error: `A file already exists at "${path}".` };
  }

  let nodeId = localNodeId(path);
  while (files[nodeId]) {
    nodeId += 'x';
  }

  const source: TreeNodeSource = { path, repository: null, branch: null, tag: null, commit: null };
  const doc = YmlUtils.toDoc(`# ${path}\n`);
  const slice: FileSlice = {
    nodeId,
    path,
    source,
    commitSha: '',
    editable: true,
    ymlDocument: doc,
    savedYmlDocument: doc,
  };
  const node: TreeNode = {
    nodeId,
    path,
    contents: YmlUtils.toYml(doc),
    source,
    commitSha: '',
    editable: true,
    includes: [],
  };

  const nextTree =
    parentNodeId && files[parentNodeId]
      ? insertChild(tree, parentNodeId, node)
      : { ...tree, includes: [...tree.includes, node] };

  bitriseYmlStore.setState({
    tree: nextTree,
    files: { ...files, [nodeId]: slice },
    mergedYmlStale: true,
  });
  openTab(nodeId, { preview: false });

  return { ok: true, nodeId };
}

export type IncludeSource = {
  path: string;
  repository?: string;
  branch?: string;
  tag?: string;
  commit?: string;
};

export type AddIncludeResult = { ok: true } | { ok: false; error: string };

/**
 * Append an `include:` directive to an editable module file. Only the directive is written — the
 * referenced file is resolved from Git on the next `/config/tree` load (no live re-resolution).
 * Mirrors the backend `YMLFile#validate_include` checks so the user gets feedback before push.
 */
export function addInclude(targetNodeId: string, source: IncludeSource): AddIncludeResult {
  const { files } = bitriseYmlStore.getState();
  const slice = files[targetNodeId];

  if (!slice) {
    return { ok: false, error: 'Select a module file to include into.' };
  }
  if (!slice.editable) {
    return { ok: false, error: `"${slice.path}" is read-only; you can't add an include to it.` };
  }

  const path = source.path.trim().replace(/^\/+/, '');
  if (!path) {
    return { ok: false, error: 'Enter a file path to include.' };
  }
  if (!/\.ya?ml$/i.test(path)) {
    return { ok: false, error: 'The path must end in .yml or .yaml.' };
  }

  const repository = source.repository?.trim() || undefined;
  const branch = source.branch?.trim() || undefined;
  const tag = source.tag?.trim() || undefined;
  const commit = source.commit?.trim() || undefined;

  if (commit && commit.length !== 40 && (commit.length <= 5 || commit.length >= 9)) {
    return { ok: false, error: 'Commit must be a short (6–8 char) or full (40 char) hash.' };
  }
  if (repository && !branch && !tag && !commit) {
    return { ok: false, error: 'When a repository is set, also provide a branch, tag or commit.' };
  }

  const entry: Record<string, string> = { path };
  if (repository) entry.repository = repository;
  if (branch) entry.branch = branch;
  if (tag) entry.tag = tag;
  if (commit) entry.commit = commit;

  updateFileDocument(targetNodeId, ({ doc }) => {
    YmlUtils.addIn(doc, ['include'], entry);
    return doc;
  });

  return { ok: true };
}

/** Apply a full YAML string to a file's slice (the global diff dialog's per-file "Apply changes"). */
export function updateFileDocumentByString(nodeId: string, ymlString: string) {
  const state = bitriseYmlStore.getState();
  if (nodeId === state.selectedNodeId) {
    updateBitriseYmlDocumentByString(ymlString);
    return;
  }
  const doc = YmlUtils.toDoc(ymlString);
  if (doc.errors.length === 0) {
    updateFileDocument(nodeId, () => doc);
  }
}

export function initializeModularConfig({
  root,
  entityIndex,
  mergedYml,
  branch,
  commitSha,
}: {
  root: TreeNode;
  entityIndex: EntityIndex;
  mergedYml?: string;
  branch?: string;
  commitSha?: string;
}) {
  const files = buildFileSlices(root);
  const rootSlice = files[root.nodeId];

  bitriseYmlStore.setState({
    tree: root,
    files,
    entityIndex,
    selectedNodeId: root.nodeId,
    openTabs: [{ nodeId: root.nodeId, isPreview: false }],
    version: '',
    ymlDocument: rootSlice.ymlDocument,
    savedYmlDocument: rootSlice.savedYmlDocument,
    __invalidYmlString: undefined,
    __savedInvalidYmlString: undefined,
    // Seed the merged tab from the bootstrap merge; if absent, leave stale so it fetches on first open.
    mergedYml,
    mergedYmlStale: mergedYml === undefined,
    savedMergedYml: mergedYml,
    configBranch: branch || undefined,
    configCommitSha: commitSha || undefined,
  });
}

/**
 * Apply a refreshed tree + index after a save / push-to-branch. Re-uses stable `node_id`s so the
 * selected file and open tabs survive the reload (tabs whose nodes vanished are dropped). Pass
 * `branch`/`commitSha` when the reload targeted a different branch so the config base is updated.
 */
export function applyModularSaveResult({
  root,
  entityIndex,
  branch,
  commitSha,
}: {
  root: TreeNode;
  entityIndex: EntityIndex;
  branch?: string;
  commitSha?: string;
}) {
  const files = buildFileSlices(root);
  const { openTabs, selectedNodeId } = bitriseYmlStore.getState();

  const nextTabs = openTabs.filter((tab) => files[tab.nodeId]);
  const selectedStillValid =
    selectedNodeId && (selectedNodeId === MERGED_CONFIG_NODE_ID || Boolean(files[selectedNodeId]));
  const nextSelected = selectedStillValid ? selectedNodeId : root.nodeId;

  // On the merged tab there's no file slice to bind, so bind the root doc transiently —
  // `useMergedConfigSync` refetches the merge (stale below) and rebinds once it arrives.
  const activeSlice = nextSelected && nextSelected !== MERGED_CONFIG_NODE_ID ? files[nextSelected] : files[root.nodeId];

  bitriseYmlStore.setState({
    tree: root,
    files,
    entityIndex,
    openTabs: nextTabs,
    selectedNodeId: nextSelected,
    version: '',
    ymlDocument: activeSlice.ymlDocument,
    savedYmlDocument: activeSlice.savedYmlDocument,
    __invalidYmlString: undefined,
    __savedInvalidYmlString: undefined,
    mergedYml: undefined,
    mergedYmlStale: true,
    ...(branch !== undefined ? { configBranch: branch || undefined } : {}),
    ...(commitSha !== undefined ? { configCommitSha: commitSha || undefined } : {}),
  });
}

/**
 * Mutate a single file's document, scoped by `node_id`. Clones ONLY the touched file's `Document`
 * so sibling slices keep object identity, preserving their `YmlUtils` WeakMap caches.
 */
export function updateFileDocument(nodeId: string, mutator: YamlMutator) {
  const { files, openTabs } = bitriseYmlStore.getState();
  const slice = files[nodeId];

  if (!slice) {
    warnInDev(`updateFileDocument: no file with node_id "${nodeId}"`);
    return;
  }

  if (!slice.editable) {
    warnInDev(`updateFileDocument: file "${slice.path}" (node_id "${nodeId}") is read-only; mutation ignored`);
    return;
  }

  const doc = slice.ymlDocument.clone();
  const nextDoc = mutator({ doc });

  bitriseYmlStore.setState({
    files: { ...files, [nodeId]: { ...slice, ymlDocument: nextDoc } },
    // A modified tab persists: promote it from preview to permanent.
    openTabs: openTabs.map((tab) => (tab.nodeId === nodeId ? { ...tab, isPreview: false } : tab)),
    mergedYmlStale: true,
  });
}

export function selectNode(nodeId: string) {
  const patch = activeFilePatch(nodeId);
  if (patch) {
    bitriseYmlStore.setState(patch);
  }
}

/**
 * Read-only active-document patch bound to the merged config. Binding `ymlDocument` to the merged
 * config makes every entity resolve locally (no ghosts); no file slice backs it, so mutations no-op.
 */
function mergedConfigPatch() {
  const { mergedYml } = bitriseYmlStore.getState();
  const doc = mergedYml !== undefined ? YmlUtils.toDoc(mergedYml) : new Document();
  return {
    selectedNodeId: MERGED_CONFIG_NODE_ID,
    version: '',
    ymlDocument: doc,
    savedYmlDocument: doc,
    __invalidYmlString: undefined,
  };
}

export function selectMergedConfig() {
  bitriseYmlStore.setState(mergedConfigPatch());
}

/** Remember the active tab's router location so it restores that page when re-selected. */
export function recordActiveTabLocation(location: string) {
  const { selectedNodeId, openTabs } = bitriseYmlStore.getState();
  if (!selectedNodeId) {
    return;
  }
  if (selectedNodeId === MERGED_CONFIG_NODE_ID) {
    bitriseYmlStore.setState({ mergedTabLastLocation: location });
    return;
  }
  bitriseYmlStore.setState({
    openTabs: openTabs.map((tab) => (tab.nodeId === selectedNodeId ? { ...tab, lastLocation: location } : tab)),
  });
}

/** Open a file in a tab and select it. Preview tabs replace any existing non-dirty preview tab. */
export function openTab(nodeId: string, { preview = true }: { preview?: boolean } = {}) {
  const { files, openTabs } = bitriseYmlStore.getState();

  const patch = activeFilePatch(nodeId);
  if (!patch) {
    return;
  }

  const existing = openTabs.find((tab) => tab.nodeId === nodeId);
  if (existing) {
    bitriseYmlStore.setState({
      ...patch,
      openTabs: preview
        ? openTabs
        : openTabs.map((tab) => (tab.nodeId === nodeId ? { ...tab, isPreview: false } : tab)),
    });
    return;
  }

  const withoutReplaceablePreview = openTabs.filter((tab) => !(tab.isPreview && !isFileDirty(files[tab.nodeId])));

  bitriseYmlStore.setState({
    ...patch,
    openTabs: [...withoutReplaceablePreview, { nodeId, isPreview: preview }],
  });
}

export function closeTab(nodeId: string) {
  const { openTabs, selectedNodeId } = bitriseYmlStore.getState();
  const index = openTabs.findIndex((tab) => tab.nodeId === nodeId);
  if (index === -1) {
    return;
  }

  const nextTabs = openTabs.filter((tab) => tab.nodeId !== nodeId);

  if (selectedNodeId !== nodeId) {
    bitriseYmlStore.setState({ openTabs: nextTabs });
    return;
  }

  // Active tab closed: rebind the active document to a neighbor (the tab that slid into this slot,
  // else the previous one), or the merged config when no tabs remain.
  const neighborNodeId = (nextTabs[index] ?? nextTabs[index - 1])?.nodeId;
  const patch = neighborNodeId ? activeFilePatch(neighborNodeId) : null;

  bitriseYmlStore.setState({
    ...(patch ?? mergedConfigPatch()),
    openTabs: nextTabs,
  });
}

export function setMergedConfig(mergedYml: string) {
  const { selectedNodeId, hasChanges } = bitriseYmlStore.getState();
  // A merge computed while nothing is dirty IS the saved baseline; while edits are pending it stays frozen.
  const savedMergedYml = hasChanges ? bitriseYmlStore.getState().savedMergedYml : mergedYml;

  if (selectedNodeId === MERGED_CONFIG_NODE_ID) {
    const doc = YmlUtils.toDoc(mergedYml);
    bitriseYmlStore.setState({
      mergedYml,
      mergedYmlStale: false,
      savedMergedYml,
      version: '',
      ymlDocument: doc,
      savedYmlDocument: doc,
      __invalidYmlString: undefined,
    });
    return;
  }

  bitriseYmlStore.setState({ mergedYml, mergedYmlStale: false, savedMergedYml });
}

bitriseYmlStore.subscribe(
  ({ ymlDocument, savedYmlDocument }) => {
    return {
      ymlDocument,
      savedYmlDocument,
    };
  },
  ({ ymlDocument, savedYmlDocument }) => {
    const state = bitriseYmlStore.getState();
    // In modular mode `hasChanges` is tree-wide (any file dirty), not just the active document.
    const hasChanges = state.tree
      ? Object.values(state.files).some((slice) => isFileDirty(slice))
      : !YmlUtils.isEquals(ymlDocument, savedYmlDocument);

    bitriseYmlStore.setState({
      yml: YmlUtils.toJSON(ymlDocument),
      hasChanges,
    });
  },
  {
    equalityFn: (a, b) => {
      return a.ymlDocument === b.ymlDocument && a.savedYmlDocument === b.savedYmlDocument;
    },
  },
);

// Keep `entityIndex` live: the BE ships a snapshot at load/save, but unsaved edits to module files
// must be reflected immediately for cross-file detection + jump-to-definition. Re-derived from the
// live file documents on every `files` change (at load they equal the BE tree, so the seed is kept).
bitriseYmlStore.subscribe(
  (s) => s.files,
  (files) => {
    const { tree, entityIndex } = bitriseYmlStore.getState();
    if (!tree) {
      return;
    }

    const next = EntityIndexService.buildFromFiles(tree, files);
    if (!EntityIndexService.equals(next, entityIndex)) {
      bitriseYmlStore.setState({ entityIndex: next });
    }

    // The document subscription only recomputes `hasChanges` for the active doc, so an edit to a
    // non-active file (addInclude, global diff Apply, background updateFileDocument) must refresh it here.
    const hasChanges = Object.values(files).some((slice) => isFileDirty(slice));
    if (hasChanges !== bitriseYmlStore.getState().hasChanges) {
      bitriseYmlStore.setState({ hasChanges });
    }
  },
);
