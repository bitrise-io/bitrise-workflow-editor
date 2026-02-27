import { createStore, StoreApi } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import { BitriseYml } from '../models/BitriseYml';
import YmlUtils from '../utils/YmlUtils';
import { initializeBitriseYmlDocument, setReadOnlyMode, setSyncToModularConfig } from './BitriseYmlStore';

// Types

export type ConfigFileTree = {
  path: string;
  contents: string;
  includes?: ConfigFileTree[];
  repository?: string;
  branch?: string;
  commit?: string;
  tag?: string;
};

export type ConfigFileEntry = {
  path: string;
  repository?: string;
  branch?: string;
  commit?: string;
  tag?: string;
  savedContents: string;
  currentContents: string;
  isReadOnly: boolean;
};

export type ModularConfigStoreState = {
  isModular: boolean;
  activeFileIndex: number; // -1 = merged tab, 0..N = individual file
  files: ConfigFileEntry[];
  mergedYmlString: string;
  isMerging: boolean;
  mergeError?: string;
};

export type ModularConfigStore = StoreApi<ModularConfigStoreState>;

// Store

export const modularConfigStore = createStore(
  subscribeWithSelector(() => ({
    isModular: false,
    activeFileIndex: -1,
    files: [] as ConfigFileEntry[],
    mergedYmlString: '',
    isMerging: false,
    mergeError: undefined as string | undefined,
  })),
);

// Helper: flatten config file tree into a flat list (DFS order)

function flattenTree(tree: ConfigFileTree, isLocalMode: boolean): ConfigFileEntry[] {
  const files: ConfigFileEntry[] = [];

  function walk(node: ConfigFileTree) {
    const isFromGitRepo = !!node.repository;
    files.push({
      path: node.path,
      repository: node.repository,
      branch: node.branch,
      commit: node.commit,
      tag: node.tag,
      savedContents: node.contents,
      currentContents: node.contents,
      // In local mode: git-repo files are read-only. Local files are editable.
      // In web mode: all files are "editable" in the UI, but save opens a modal.
      isReadOnly: isLocalMode && isFromGitRepo,
    });

    if (node.includes) {
      for (const child of node.includes) {
        walk(child);
      }
    }
  }

  walk(tree);
  return files;
}

// Build a ConfigFileTree from the current files state (for merge API calls)

export function buildTreeFromFiles(files: ConfigFileEntry[], originalTree: ConfigFileTree): ConfigFileTree {
  const contentsMap = new Map<string, string>();
  for (const file of files) {
    contentsMap.set(file.path, file.currentContents);
  }

  function rebuildNode(node: ConfigFileTree): ConfigFileTree {
    return {
      ...node,
      contents: contentsMap.get(node.path) ?? node.contents,
      includes: node.includes?.map(rebuildNode),
    };
  }

  return rebuildNode(originalTree);
}

// Actions

let originalTree: ConfigFileTree | undefined;
let _isSwitchingTabs = false;

let _isLocalMode = false;

export function getOriginalTree(): ConfigFileTree | undefined {
  return originalTree;
}

/**
 * Refresh the file list from a new config tree (e.g. when includes change).
 * Preserves unsaved changes for files that still exist in the new tree.
 */
export function refreshModularConfig(newTree: ConfigFileTree) {
  const state = modularConfigStore.getState();
  const oldFiles = state.files;

  // Build a map of unsaved changes from the old file list
  const unsavedChanges = new Map<string, string>();
  oldFiles.forEach((f) => {
    if (f.currentContents !== f.savedContents) {
      unsavedChanges.set(f.path, f.currentContents);
    }
  });

  originalTree = newTree;
  const newFiles = flattenTree(newTree, _isLocalMode);

  // Restore unsaved changes for files that still exist
  const mergedFiles = newFiles.map((f) => {
    const unsaved = unsavedChanges.get(f.path);
    if (unsaved !== undefined) {
      return { ...f, currentContents: unsaved };
    }
    return f;
  });

  // If the active tab's file no longer exists, switch to merged tab
  let { activeFileIndex } = state;
  if (activeFileIndex >= 0) {
    const activeFilePath = oldFiles[activeFileIndex]?.path;
    const newIndex = mergedFiles.findIndex((f) => f.path === activeFilePath);
    if (newIndex < 0) {
      activeFileIndex = -1;
      setReadOnlyMode(true);
    } else {
      activeFileIndex = newIndex;
    }
  }

  modularConfigStore.setState({ files: mergedFiles, activeFileIndex });
}

export function initializeModularConfig(tree: ConfigFileTree, isLocalMode: boolean) {
  originalTree = tree;
  _isLocalMode = isLocalMode;
  const files = flattenTree(tree, isLocalMode);

  modularConfigStore.setState({
    isModular: true,
    activeFileIndex: -1, // Default to merged tab (read-only)
    files,
    mergedYmlString: '',
    isMerging: false,
    mergeError: undefined,
  });

  // Merged tab is read-only
  setReadOnlyMode(true);
}

export function setActiveFileIndex(index: number, version: string) {
  const state = modularConfigStore.getState();
  const prevIndex = state.activeFileIndex;

  if (prevIndex === index) return;

  // Suppress the sync callback while we switch tabs, otherwise loading
  // the new file's content into BitriseYmlStore would overwrite the old
  // file entry in ModularConfigStore.
  _isSwitchingTabs = true;

  modularConfigStore.setState({ activeFileIndex: index });

  // Set read-only mode: merged tab (-1) or read-only files are non-editable
  const isReadOnly = index === -1 || (index >= 0 && state.files[index]?.isReadOnly === true);
  setReadOnlyMode(isReadOnly);

  if (index === -1) {
    // Switch to merged tab: load merged YAML into BitriseYmlStore
    initializeBitriseYmlDocument({ ymlString: state.mergedYmlString, version });
  } else {
    // Switch to individual file tab: load that file's contents
    const file = state.files[index];
    if (file) {
      initializeBitriseYmlDocument({ ymlString: file.currentContents, version });
    }
  }

  _isSwitchingTabs = false;
}

export function updateFileContents(index: number, contents: string) {
  const state = modularConfigStore.getState();
  const files = [...state.files];

  if (index >= 0 && index < files.length) {
    files[index] = { ...files[index], currentContents: contents };
    modularConfigStore.setState({ files });
  }
}

export function syncCurrentFileFromEditor(ymlString: string) {
  const { activeFileIndex } = modularConfigStore.getState();
  if (activeFileIndex >= 0) {
    updateFileContents(activeFileIndex, ymlString);
  }
}

export function updateMergedResult(yml: string) {
  modularConfigStore.setState({
    mergedYmlString: yml,
    isMerging: false,
    mergeError: undefined,
  });
}

export function setMerging(isMerging: boolean) {
  modularConfigStore.setState({ isMerging });
}

export function setMergeError(error: string) {
  modularConfigStore.setState({
    isMerging: false,
    mergeError: error,
  });
}

export function discardAllChanges(version: string) {
  const state = modularConfigStore.getState();
  const files = state.files.map((f) => ({
    ...f,
    currentContents: f.savedContents,
  }));

  modularConfigStore.setState({ files });

  // Reload the active view
  if (state.activeFileIndex === -1) {
    // Will need to re-merge after discard
    initializeBitriseYmlDocument({ ymlString: state.mergedYmlString, version });
  } else {
    const file = files[state.activeFileIndex];
    if (file) {
      initializeBitriseYmlDocument({ ymlString: file.currentContents, version });
    }
  }
}

export function markFilesSaved(indices: number[]) {
  const state = modularConfigStore.getState();
  const files = state.files.map((f, i) => {
    if (indices.includes(i)) {
      return { ...f, savedContents: f.currentContents };
    }
    return f;
  });

  modularConfigStore.setState({ files });
}

export function markAllFilesSaved() {
  const state = modularConfigStore.getState();
  const files = state.files.map((f) => ({
    ...f,
    savedContents: f.currentContents,
  }));
  modularConfigStore.setState({ files });
}

export function resetModularConfig() {
  originalTree = undefined;
  setReadOnlyMode(false);
  modularConfigStore.setState({
    isModular: false,
    activeFileIndex: -1,
    files: [],
    mergedYmlString: '',
    isMerging: false,
    mergeError: undefined,
  });
}

// Register the sync callback so BitriseYmlStore pushes changes back here.
// When visual pages mutate BitriseYmlStore (e.g. add workflow), this keeps
// the active file in ModularConfigStore in sync.
setSyncToModularConfig((ymlString: string) => {
  if (_isSwitchingTabs) return;
  const { isModular, activeFileIndex } = modularConfigStore.getState();
  if (!isModular || activeFileIndex < 0) return;
  updateFileContents(activeFileIndex, ymlString);
});

// --- Entity ownership ---

/**
 * Check if an entity exists in the active file (not just in merged state).
 * Returns true when not in modular mode (everything is editable).
 */
export function isEntityInActiveFile(section: string, entityId: string): boolean {
  const { isModular, activeFileIndex, files } = modularConfigStore.getState();
  if (!isModular || activeFileIndex < 0) return true;

  const file = files[activeFileIndex];
  if (!file) return false;

  try {
    const doc = YmlUtils.toDoc(file.currentContents);
    if (doc.errors.length > 0) return false;
    const parsed = YmlUtils.toJSON(doc) as unknown as Record<string, Record<string, unknown> | undefined>;
    const sectionData = parsed[section];
    return sectionData != null && entityId in sectionData;
  } catch {
    return false;
  }
}

// Derived state helpers

export function getHasAnyChanges(): boolean {
  const { files } = modularConfigStore.getState();
  return files.some((f) => f.currentContents !== f.savedContents);
}

export function getChangedFileIndices(): number[] {
  const { files } = modularConfigStore.getState();
  return files.reduce<number[]>((acc, f, i) => {
    if (f.currentContents !== f.savedContents) acc.push(i);
    return acc;
  }, []);
}

export function getChangedEditableFiles(): ConfigFileEntry[] {
  const { files } = modularConfigStore.getState();
  return files.filter((f) => !f.isReadOnly && f.currentContents !== f.savedContents);
}

/**
 * Find which file contains a given entity (workflow, step_bundle, pipeline, etc.)
 * by parsing each file's YAML and checking for the entity ID under the given section.
 */
export function findFileIndexForEntity(section: string, entityId: string): number {
  const { files } = modularConfigStore.getState();

  return files.findIndex((f) => {
    try {
      const doc = YmlUtils.toDoc(f.currentContents);
      if (doc.errors.length > 0) return false;
      const parsed = YmlUtils.toJSON(doc) as unknown as Record<string, Record<string, unknown> | undefined>;
      const sectionData = parsed[section];
      return sectionData != null && entityId in sectionData;
    } catch {
      return false;
    }
  });
}

export function getMergedBitriseYml(): BitriseYml | undefined {
  const { mergedYmlString } = modularConfigStore.getState();
  if (!mergedYmlString) return undefined;

  try {
    const doc = YmlUtils.toDoc(mergedYmlString);
    if (doc.errors.length > 0) return undefined;
    return YmlUtils.toJSON(doc);
  } catch {
    return undefined;
  }
}
