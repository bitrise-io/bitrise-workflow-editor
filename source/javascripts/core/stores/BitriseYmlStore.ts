import { Document } from 'yaml';
import { createStore, ExtractState, StoreApi } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import { BitriseYml } from '../models/BitriseYml';
import { TreeNode, TreeNodeSource } from '../models/Tree';
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

/** Node id of a single-file config's one file. A single-file config is a tree with one file. */
export const SINGLE_FILE_NODE_ID = 'n_single_file';

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

/** State patch loading a whole tree: its structure, its files and their entity index. */
function treeState(root: TreeNode, files: Record<string, FileSlice>) {
  return { tree: root, files, entityIndex: EntityIndexService.buildFromFiles(root, files) };
}

/** State patch binding a file as the document the whole editor reads and writes. */
function bindFile(slice: FileSlice) {
  return { selectedNodeId: slice.nodeId, ymlDocument: slice.ymlDocument, savedYmlDocument: slice.savedYmlDocument };
}

/**
 * State patch binding the merged config instead. Every entity resolves there (no ghosts), and no file
 * backs it, so writes no-op.
 */
function bindMerged(doc: Document) {
  return { selectedNodeId: MERGED_CONFIG_NODE_ID, ymlDocument: doc, savedYmlDocument: doc };
}

/** The store state of a single-file config: a tree with one file, bound and open, with no merged view. */
function singleFileState({ ymlString, commitSha }: { ymlString: string; commitSha?: string }) {
  // `bitrise.yml` keeps the file on the same editor model as before (`ROOT_MODEL_URI`).
  const root: TreeNode = {
    nodeId: SINGLE_FILE_NODE_ID,
    path: 'bitrise.yml',
    contents: ymlString,
    source: null,
    commitSha: commitSha ?? '',
    editable: true,
    includes: [],
  };
  const files = buildFileSlices(root);

  return {
    ...treeState(root, files),
    ...bindFile(files[root.nodeId]),
    openTabs: [{ nodeId: root.nodeId, isPreview: false }],
    mergedTabLastLocation: undefined,
    mergedYml: undefined,
    mergedYmlStale: true,
    savedMergedYml: undefined,
  };
}

/** An empty single-file config, until one loads. */
const emptyConfig = singleFileState({ ymlString: '' });

export const bitriseYmlStore = createStore(
  subscribeWithSelector(() => ({
    version: '',
    yml: {} as BitriseYml,
    hasChanges: false,
    discardKey: Date.now(),
    ymlDocument: emptyConfig.ymlDocument,
    savedYmlDocument: emptyConfig.savedYmlDocument,
    validationStatus: 'pending' as 'valid' | 'invalid' | 'warnings' | 'pending',
    configBranch: undefined as string | undefined,
    configCommitSha: undefined as string | undefined,

    // Modular YAML tree state. `tree` is the structural skeleton (for traversal);
    // `files` is the source of truth for live contents.
    tree: emptyConfig.tree as TreeNode | undefined,
    files: emptyConfig.files as Record<string, FileSlice>,
    entityIndex: emptyConfig.entityIndex,
    selectedNodeId: emptyConfig.selectedNodeId as string | undefined,
    openTabs: emptyConfig.openTabs as OpenTab[],
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
  const { savedYmlDocument, ymlDocument } = bitriseYmlStore.getState();
  return YmlUtils.toYml(from === 'savedYmlDocument' ? savedYmlDocument : ymlDocument);
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

  // Revert every file to its saved document; the tree and open tabs are unchanged.
  const files: Record<string, FileSlice> = {};
  Object.values(state.files).forEach((slice) => {
    files[slice.nodeId] = { ...slice, ymlDocument: slice.savedYmlDocument };
  });

  const activeSlice = state.selectedNodeId ? files[state.selectedNodeId] : undefined;

  bitriseYmlStore.setState({
    discardKey: Date.now(),
    files,
    ...(activeSlice ? bindFile(activeSlice) : bindMerged(state.savedYmlDocument)),
    mergedYmlStale: true,
  });
}

/** The active file slice if it's editable, else `undefined` after a dev warning. */
function editableActiveSlice(caller: string): { nodeId: string; slice: FileSlice } | undefined {
  const state = bitriseYmlStore.getState();
  const nodeId = state.selectedNodeId;
  const slice = nodeId ? state.files[nodeId] : undefined;

  if (!nodeId || !slice) {
    warnInDev(`${caller}: no editable file is active (selected "${nodeId}"); mutation ignored`);
    return undefined;
  }
  if (!slice.editable) {
    warnInDev(`${caller}: file "${slice.path}" is read-only; mutation ignored`);
    return undefined;
  }

  return { nodeId, slice };
}

/** Bind `doc` as both the active document and the active file slice's live contents. */
function commitActiveFileDocument(nodeId: string, slice: FileSlice, doc: Document) {
  bitriseYmlStore.setState({
    ymlDocument: doc,
    files: { ...bitriseYmlStore.getState().files, [nodeId]: { ...slice, ymlDocument: doc } },
    mergedYmlStale: true,
  });
}

/** Returns its parse of `ymlString`, even when that has errors. */
export function updateBitriseYmlDocumentByString(ymlString: string) {
  const doc = YmlUtils.toDoc(ymlString);

  const active = editableActiveSlice('updateBitriseYmlDocumentByString');
  if (active) {
    commitActiveFileDocument(active.nodeId, active.slice, doc);
  }
  return doc;
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
  bitriseYmlStore.setState({
    ...singleFileState({ ymlString, commitSha }),
    // Single-file conflict detection keys off `version`; a modular config's off the commit SHA.
    version,
    configBranch: branch || undefined,
    configCommitSha: commitSha || undefined,
  });
}

/** Every document of the config, one per file. */
export function configDocuments(s: BitriseYmlStoreState) {
  return Object.values(s.files).map((file) => file.ymlDocument);
}

/**
 * What the editor can do with the config, read from its documents in one place. The visual editor,
 * its alert, Save and service writes all decide from this.
 */
export function configStatus(s: BitriseYmlStoreState) {
  const documents = configDocuments(s);
  const openYmlParses = s.ymlDocument.errors.length === 0;
  return {
    /** The open YAML parses. The visual editor and service writes need it. */
    openYmlParses,
    /** The open YAML already didn't parse when it loaded, rather than while the user types. */
    openYmlLoadedBroken: !openYmlParses && s.savedYmlDocument.errors.length > 0,
    /** Every file parses. Saving needs it, because the save validates the whole config. */
    everyFileParses: documents.every((doc) => doc.errors.length === 0),
    /** Some file uses aliases or merge keys, which the visual editor can't walk. */
    usesAliases: documents.some(YmlUtils.hasAliasesOrMergeKeys),
  };
}

export function updateBitriseYmlDocument(mutator: YamlMutator) {
  const state = bitriseYmlStore.getState();

  // The document holds what the user typed, so a write can't be built on it until it parses.
  if (!configStatus(state).openYmlParses) {
    warnInDev("updateBitriseYmlDocument: the open YAML doesn't parse; mutation ignored");
    return;
  }

  // The active tab's file IS the document the whole WFE edits.
  // Read-only (cross-ref) files no-op (defense-in-depth — UI should already gate this).
  const active = editableActiveSlice('updateBitriseYmlDocument');
  if (!active) {
    return;
  }

  commitActiveFileDocument(active.nodeId, active.slice, mutator({ doc: state.ymlDocument.clone() }));
}

export function isFileDirty(slice?: FileSlice) {
  if (!slice) {
    return false;
  }
  return !YmlUtils.isEquals(slice.ymlDocument, slice.savedYmlDocument);
}

/** {@link bindFile} for a node id, or `null` after a dev warning when there's no such file. */
function bindFileById(nodeId: string) {
  const slice = bitriseYmlStore.getState().files[nodeId];
  if (!slice) {
    warnInDev(`bindFile: no file with node_id "${nodeId}"`);
    return null;
  }
  return bindFile(slice);
}

/** The merged config as a document, or an empty one while there's no merge. */
function mergedDocument() {
  const { mergedYml } = bitriseYmlStore.getState();
  return mergedYml !== undefined ? YmlUtils.toDoc(mergedYml) : new Document();
}

export function getFileSlice(nodeId: string): FileSlice | undefined {
  return bitriseYmlStore.getState().files[nodeId];
}

export function getFileYmlString(nodeId: string): string {
  const slice = bitriseYmlStore.getState().files[nodeId];
  return slice ? YmlUtils.toYml(slice.ymlDocument) : '';
}

/**
 * Whether the open config is modular, meaning it has includes. Ask this for what the user sees (tabs,
 * the merged view, save routing), and leave `tree` to code that walks the files.
 */
export function isModularConfig(s: BitriseYmlStoreState) {
  return Boolean(s.tree && TreeService.hasIncludes(s.tree));
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
      modified: !YmlUtils.isEquals(slice.ymlDocument, slice.savedYmlDocument),
    };
  });

  return TreeService.serializeTree(tree, live);
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
  mergedYml,
  branch,
  commitSha,
}: {
  root: TreeNode;
  mergedYml?: string;
  branch?: string;
  commitSha?: string;
}) {
  const files = buildFileSlices(root);
  // Same rule as `setMergedConfig`: an empty merge counts as no merge.
  const merge = mergedYml || undefined;

  // A modular config opens on the merged view: it's the only tab where every entity resolves, so a
  // URL pointing at a workflow defined in an included module lands on that workflow instead of the
  // root file's arbitrary first one. The root file is open beside it, just not selected.
  //
  // With no merge (`InitialDataLoader` couldn't get one) the root file is selected instead. Binding
  // it under the merged tab would be worse than not selecting that tab: a module's entity would
  // resolve there against the root document and the page would rewrite the URL — the very bug the
  // merged default fixes. The merged tab stays stale, so re-selecting it retries the merge.
  bitriseYmlStore.setState({
    ...treeState(root, files),
    ...(merge !== undefined ? bindMerged(YmlUtils.toDoc(merge)) : bindFile(files[root.nodeId])),
    openTabs: [{ nodeId: root.nodeId, isPreview: false }],
    // Seed the merged tab from the bootstrap merge; if absent, leave stale so it fetches on first open.
    mergedYml: merge,
    mergedYmlStale: merge === undefined,
    savedMergedYml: merge,
    // `version` is unused in modular mode (conflict detection keys off commit_sha).
    version: '',
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
  branch,
  commitSha,
}: {
  root: TreeNode;
  branch?: string;
  commitSha?: string;
}) {
  // A save that removed every include leaves a single-file config, so it opens like one.
  if (!TreeService.hasIncludes(root)) {
    const { configBranch, configCommitSha } = bitriseYmlStore.getState();
    initializeBitriseYmlDocument({
      ymlString: root.contents,
      version: '',
      branch: branch ?? configBranch,
      commitSha: commitSha ?? configCommitSha,
    });
    return;
  }

  const files = buildFileSlices(root);
  const { openTabs, selectedNodeId, ymlDocument } = bitriseYmlStore.getState();

  const nextTabs = openTabs.filter((tab) => files[tab.nodeId]);
  const selectedStillValid =
    selectedNodeId && (selectedNodeId === MERGED_CONFIG_NODE_ID || Boolean(files[selectedNodeId]));
  const nextSelected = selectedStillValid ? selectedNodeId : root.nodeId;

  // On the merged tab there's no file slice to bind, so the merge on screen stays bound until
  // `useMergedConfigSync` refetches it (stale below) and rebinds.
  bitriseYmlStore.setState({
    ...treeState(root, files),
    ...(nextSelected === MERGED_CONFIG_NODE_ID ? bindMerged(ymlDocument) : bindFile(files[nextSelected])),
    openTabs: nextTabs,
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
  const patch = bindFileById(nodeId);
  if (patch) {
    bitriseYmlStore.setState(patch);
  }
}

export function selectMergedConfig() {
  bitriseYmlStore.setState(bindMerged(mergedDocument()));
}

/** True when a raw hash location points at the YAML page (matches `paths.yml`, which core can't import). */
export function isYmlPageLocation(location: string) {
  return /^yml($|[?/])/.test(location.replace(/^#?!?\/?/, ''));
}

/**
 * Remember the active tab's visual-mode page so it restores when re-selected.
 * YAML-page locations are never recorded: code view is a global mode shared by
 * all tabs, so per-tab memory only holds visual pages.
 */
export function recordActiveTabLocation(location: string) {
  const { selectedNodeId, openTabs } = bitriseYmlStore.getState();
  if (!selectedNodeId || isYmlPageLocation(location)) {
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

/** The visual-mode page remembered for a tab (the merged tab included). */
export function getTabLastLocation(nodeId: string) {
  const { openTabs, mergedTabLastLocation } = bitriseYmlStore.getState();
  if (nodeId === MERGED_CONFIG_NODE_ID) {
    return mergedTabLastLocation;
  }
  return openTabs.find((tab) => tab.nodeId === nodeId)?.lastLocation;
}

/** Open a file in a tab and select it. Preview tabs replace any existing non-dirty preview tab. */
export function openTab(nodeId: string, { preview = true }: { preview?: boolean } = {}) {
  const { files, openTabs } = bitriseYmlStore.getState();

  const patch = bindFileById(nodeId);
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
  const patch = neighborNodeId ? bindFileById(neighborNodeId) : null;

  bitriseYmlStore.setState({
    ...(patch ?? bindMerged(mergedDocument())),
    openTabs: nextTabs,
  });
}

/**
 * Discard a single file's unsaved changes and close its tab — the per-tab counterpart to
 * {@link discardBitriseYmlDocument}. The file is reverted to its saved baseline and kept in the
 * tree. No-ops for a non-modular doc (no file slice) or an unknown node.
 */
export function discardFile(nodeId: string) {
  const state = bitriseYmlStore.getState();
  const slice = state.files[nodeId];
  if (!slice) {
    return;
  }

  // Revert the file's edits to its saved baseline, keep it in the tree, then close the tab.
  bitriseYmlStore.setState({
    files: { ...state.files, [nodeId]: { ...slice, ymlDocument: slice.savedYmlDocument } },
    mergedYmlStale: true,
  });
  closeTab(nodeId);
}

export function setMergedConfig(mergedYml: string) {
  // An empty merge is a failed merge, not a config that merges to nothing — `getMergedConfig`
  // returns `''` for a response without a merge. Accepting it would clear `mergedYmlStale` and bind
  // an empty document, so the merged tab would show a blank "successful" merge with no retry left.
  if (!mergedYml) {
    warnInDev('setMergedConfig: empty merge ignored, leaving the merged config stale');
    return;
  }

  const { selectedNodeId, hasChanges } = bitriseYmlStore.getState();
  // A merge computed while nothing is dirty IS the saved baseline; while edits are pending it stays frozen.
  const savedMergedYml = hasChanges ? bitriseYmlStore.getState().savedMergedYml : mergedYml;

  if (selectedNodeId === MERGED_CONFIG_NODE_ID) {
    bitriseYmlStore.setState({
      mergedYml,
      mergedYmlStale: false,
      savedMergedYml,
      ...bindMerged(YmlUtils.toDoc(mergedYml)),
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
  ({ ymlDocument, savedYmlDocument }, prev) => {
    const state = bitriseYmlStore.getState();
    // `hasChanges` is tree-wide (any file dirty), not just the active document.
    const hasChanges = Object.values(state.files).some((slice) => isFileDirty(slice));

    // A document that doesn't parse has no reliable JSON (an alias with no anchor throws). While the
    // user types, the pages keep the last version that parsed; a newly bound one reads as empty.
    let { yml } = state;
    if (ymlDocument.errors.length === 0) {
      yml = YmlUtils.toJSON(ymlDocument);
    } else if (savedYmlDocument !== prev.savedYmlDocument) {
      yml = {} as BitriseYml;
    }

    bitriseYmlStore.setState({ yml, hasChanges });
  },
  {
    equalityFn: (a, b) => {
      return a.ymlDocument === b.ymlDocument && a.savedYmlDocument === b.savedYmlDocument;
    },
  },
);

// Re-derive the entity index from the live file documents on every `files` change so unsaved edits
// are reflected immediately for cross-file detection + jump-to-definition.
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
    // non-active file (global diff Apply, background updateFileDocument) must refresh it here.
    const hasChanges = Object.values(files).some((slice) => isFileDirty(slice));
    if (hasChanges !== bitriseYmlStore.getState().hasChanges) {
      bitriseYmlStore.setState({ hasChanges });
    }
  },
);
