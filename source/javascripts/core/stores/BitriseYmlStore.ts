/* eslint-disable @typescript-eslint/naming-convention */
import { Document } from 'yaml';
import { createStore, ExtractState, StoreApi } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import { BitriseYml } from '../models/BitriseYml';
import { emptyEntityIndex, EntityIndex, TreeNode, TreeNodeSource } from '../models/Tree';
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

/** An open file tab. Preview tabs are replaced by the next opened file. */
export type OpenTab = {
  nodeId: string;
  isPreview: boolean;
  // Last router location (raw `window.location.hash`) seen while this tab was
  // active, so re-selecting it restores the page it was on instead of
  // inheriting whatever page the previously-active tab left in the URL.
  lastLocation?: string;
};

/**
 * Reserved id for the always-present "Merged Config" tab. Not a real
 * `node_id` (no `n_` prefix) so it can't collide with a BE-emitted one.
 */
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

    // --- Modular YAML tree state (see core/models/Tree.ts) ---
    // Structural skeleton (include hierarchy + node identity). `files` is the
    // source of truth for live contents/version; `tree` is for traversal.
    tree: undefined as TreeNode | undefined,
    files: {} as Record<string, FileSlice>,
    entityIndex: emptyEntityIndex(),
    selectedNodeId: undefined as string | undefined,
    openTabs: [] as OpenTab[],
    // Per-tab page memory for the Merged tab (it lives outside `openTabs`, so it
    // can't carry its own `lastLocation` there). Mirrors `OpenTab.lastLocation`.
    mergedTabLastLocation: undefined as string | undefined,
    // Merged config: seeded from the bootstrap response, re-fetched on demand
    // (POST /config/merge) whenever a file edit marks it stale.
    mergedYml: undefined as string | undefined,
    mergedYmlStale: true,
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
    // RuntimeUtils reads window.env, which is absent outside the browser
    // (e.g. unit tests) — treat that as non-production so the warning shows.
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

  // Single-file mode: revert the one document, unchanged.
  if (!state.tree) {
    bitriseYmlStore.setState({
      discardKey: Date.now(),
      ymlDocument: state.savedYmlDocument.clone(),
      __invalidYmlString: state.__savedInvalidYmlString,
    });
    return;
  }

  // Modular mode: discard every file's edits back to its saved document, then
  // rebind the active editing document to the (now-reverted) active file.
  const files: Record<string, FileSlice> = {};
  Object.values(state.files).forEach((slice) => {
    files[slice.nodeId] = { ...slice, ymlDocument: slice.savedYmlDocument };
  });
  const activeSlice = state.selectedNodeId ? files[state.selectedNodeId] : undefined;

  bitriseYmlStore.setState({
    discardKey: Date.now(),
    files,
    ymlDocument: activeSlice ? activeSlice.savedYmlDocument : state.savedYmlDocument,
    savedYmlDocument: activeSlice ? activeSlice.savedYmlDocument : state.savedYmlDocument,
    __invalidYmlString: undefined,
    // File contents just changed (reverted to saved), so the merged config no
    // longer reflects them — refetch it. On the merged tab this is what resets
    // the view to the original merge (it has no file slice to rebind from).
    mergedYmlStale: true,
  });
}

export function updateBitriseYmlDocumentByString(ymlString: string) {
  const state = bitriseYmlStore.getState();
  const doc = YmlUtils.toDoc(ymlString);

  // Single-file mode: unchanged.
  if (!state.tree) {
    if (doc.errors.length === 0) {
      bitriseYmlStore.setState({ ymlDocument: doc, __invalidYmlString: undefined });
    } else {
      bitriseYmlStore.setState({ __invalidYmlString: ymlString });
    }
    return;
  }

  // Modular mode: route source-edits into the active file's slice.
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
      // The merged config no longer reflects this edit — refetch on next open.
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

  // Single-file mode: edit the one document, unchanged.
  if (!state.tree) {
    bitriseYmlStore.setState({
      ymlDocument: mutator({ doc: state.ymlDocument.clone() }),
      __invalidYmlString: undefined,
    });
    return;
  }

  // Modular mode: the active tab's file IS the document the whole WFE edits.
  // Mutating writes back to that file's slice so its tab stays current and the
  // tree save picks it up; read-only (cross-ref) files no-op (defense-in-depth).
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
    // The merged config no longer reflects this edit — refetch on next open.
    mergedYmlStale: true,
  });
}

// --- Modular YAML tree actions ---

function isFileDirty(slice?: FileSlice) {
  return !!slice && !YmlUtils.isEquals(slice.ymlDocument, slice.savedYmlDocument);
}

/**
 * State patch that makes a file's slice the active editing document — the single
 * `ymlDocument` the whole WFE reads and writes. In modular mode "the active
 * file" replaces the hardwired `bitrise.yml`; switching tabs swaps which file's
 * document the editor is bound to. Returns null for an unknown node.
 */
function activeFilePatch(nodeId: string) {
  const slice = bitriseYmlStore.getState().files[nodeId];
  if (!slice) {
    warnInDev(`activeFile: no file with node_id "${nodeId}"`);
    return null;
  }
  return {
    selectedNodeId: nodeId,
    // The single-file `version` token is unused in modular mode (the git/repo
    // path keys conflict detection off commit_sha), so it stays empty here.
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
      // Same object as ymlDocument until the first edit clones it (matches the
      // single-file init pattern); isEquals(a, a) === true ⇒ not dirty.
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

/**
 * Build a wire-ready tree from live file state — the full tree (every node,
 * regardless of dirty state), with each node's `contents` taken from its live
 * document. Used to assemble the save / merged-config payloads.
 */
export function getModularConfigTree(): TreeNode | undefined {
  const { tree, files } = bitriseYmlStore.getState();
  if (!tree) {
    return undefined;
  }

  const live: Record<string, { contents: string; modified: boolean }> = {};
  Object.values(files).forEach((slice) => {
    live[slice.nodeId] = {
      contents: YmlUtils.toYml(slice.ymlDocument),
      modified: !YmlUtils.isEquals(slice.ymlDocument, slice.savedYmlDocument),
    };
  });

  return TreeService.serializeTree(tree, live);
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
    // The root file is the initial active document the whole WFE binds to.
    version: '',
    ymlDocument: rootSlice.ymlDocument,
    savedYmlDocument: rootSlice.savedYmlDocument,
    __invalidYmlString: undefined,
    __savedInvalidYmlString: undefined,
    // Seed the Merged-config tab with the BE's bootstrap merge so it renders
    // instantly without a round-trip. If the BE couldn't merge (mergedYml
    // absent), leave it stale so the tab fetches on first open. Either way, any
    // local edit flips it stale → re-fetched via POST /config/merge.
    mergedYml,
    mergedYmlStale: mergedYml === undefined,
    configBranch: branch || undefined,
    configCommitSha: commitSha || undefined,
  });
}

/**
 * Apply a refreshed tree + index after a successful save. Re-uses stable
 * `node_id`s so the selected file and open tabs are preserved across the
 * post-save reload; tabs whose nodes vanished (e.g. an `include:` was removed)
 * are dropped.
 */
export function applyModularSaveResult({ root, entityIndex }: { root: TreeNode; entityIndex: EntityIndex }) {
  const files = buildFileSlices(root);
  const { openTabs, selectedNodeId } = bitriseYmlStore.getState();

  const nextTabs = openTabs.filter((tab) => files[tab.nodeId]);
  const selectedStillValid =
    selectedNodeId && (selectedNodeId === MERGED_CONFIG_NODE_ID || Boolean(files[selectedNodeId]));
  const nextSelected = selectedStillValid ? selectedNodeId : root.nodeId;

  // Rebind the active editing document to the refreshed active file (or root).
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
  });
}

/**
 * Mutate a single file's document, scoped by `node_id`. Clones ONLY the touched
 * file's `Document` so sibling slices (and their documents) keep object
 * identity — preserving their `YmlUtils.collectPaths` / `isEquals` WeakMap
 * caches. No-ops (with a dev warning) for unknown or read-only nodes; UI
 * affordances should already be gated, this is defense-in-depth.
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
 * Build a read-only active-document patch bound to the merged config. The whole
 * WFE reads `ymlDocument`, so binding it to the *merged* config makes every
 * entity resolve locally — cross-file references render as normal entities
 * instead of ghosts, since on the merged view nothing lives "in another file".
 * No file slice backs the merged node, so `updateBitriseYmlDocument` no-ops →
 * the view is effectively read-only. Falls back to an empty document until the
 * merge is available (seeded at bootstrap, refreshed on demand).
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

/**
 * Remember the current router location on the active tab. Callers pass the live
 * location (raw `window.location.hash`) just before switching away, so the tab
 * can restore that page when re-selected. The merged tab is remembered too (in
 * `mergedTabLastLocation`, since it isn't an `openTabs` entry). No-op when no tab
 * is active.
 */
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

/**
 * Open a file in a tab and select it. Preview tabs (the default) replace any
 * existing, non-dirty preview tab — matching the "single-click previews,
 * edit/double-click pins" semantics. `preview: false` opens a permanent tab.
 */
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

  // Closing an inactive tab doesn't change what the content window shows.
  if (selectedNodeId !== nodeId) {
    bitriseYmlStore.setState({ openTabs: nextTabs });
    return;
  }

  // The active tab was closed: select a neighbor (the tab that slid into this
  // slot, else the previous one) and REBIND the active editing document to it —
  // the whole WFE reads `ymlDocument`, so selecting without rebinding would
  // leave the content window showing the closed file. With no tabs left, fall
  // back to the (read-only) merged config view.
  const neighborNodeId = (nextTabs[index] ?? nextTabs[index - 1])?.nodeId;
  const patch = neighborNodeId ? activeFilePatch(neighborNodeId) : null;

  bitriseYmlStore.setState({
    // No tabs left → fall back to the merged config, binding the active document
    // to it (not just flipping `selectedNodeId`) so the views render the merged
    // config; otherwise they'd keep showing the just-closed file, where other
    // files' entities look like cross-file ghosts.
    ...(patch ?? mergedConfigPatch()),
    openTabs: nextTabs,
  });
}

export function setMergedConfig(mergedYml: string) {
  const { selectedNodeId } = bitriseYmlStore.getState();

  // If the merged tab is currently active, rebind the active document to the
  // freshly merged config so the entity views update in place.
  if (selectedNodeId === MERGED_CONFIG_NODE_ID) {
    const doc = YmlUtils.toDoc(mergedYml);
    bitriseYmlStore.setState({
      mergedYml,
      mergedYmlStale: false,
      version: '',
      ymlDocument: doc,
      savedYmlDocument: doc,
      __invalidYmlString: undefined,
    });
    return;
  }

  bitriseYmlStore.setState({ mergedYml, mergedYmlStale: false });
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
    // `yml` always reflects the active document. In modular mode `hasChanges` is
    // tree-wide (any file dirty), so Save/discard see edits across all tabs, not
    // just the one currently open.
    const hasChanges = state.tree
      ? Object.values(state.files).some((slice) => !YmlUtils.isEquals(slice.ymlDocument, slice.savedYmlDocument))
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
