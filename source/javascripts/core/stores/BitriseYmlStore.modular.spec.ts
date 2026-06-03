import { TreeNode } from '@/core/models/Tree';
import YmlUtils from '@/core/utils/YmlUtils';

import {
  applyModularSaveResult,
  bitriseYmlStore,
  closeTab,
  discardBitriseYmlDocument,
  getModularConfigTree,
  initializeModularConfig,
  MERGED_CONFIG_NODE_ID,
  openTab,
  recordActiveTabLocation,
  selectMergedConfig,
  selectNode,
  setMergedConfig,
  updateBitriseYmlDocument,
  updateBitriseYmlDocumentByString,
  updateFileDocument,
} from './BitriseYmlStore';

function node(nodeId: string, overrides: Partial<TreeNode> = {}): TreeNode {
  return {
    nodeId,
    path: `${nodeId}.yml`,
    contents: `workflows:\n  ${nodeId}: {}\n`,
    source: null,
    commitSha: 'sha',
    version: `v-${nodeId}`,
    editable: true,
    includes: [],
    ...overrides,
  };
}

function buildRoot(): TreeNode {
  return node('root', {
    path: 'bitrise.yml',
    contents: 'format_version: "13"\n',
    includes: [
      node('child-a'),
      node('child-b'),
      node('readonly', {
        editable: false,
        source: { path: 'shared.yml', repository: 'shared', branch: null, tag: null, commit: null },
      }),
    ],
  });
}

const entityIndex = {
  workflows: { 'child-a': { nodeId: 'child-a' } },
  pipelines: {},
  stepBundles: {},
};

function init() {
  initializeModularConfig({ root: buildRoot(), entityIndex, branch: 'main', commitSha: 'abc' });
}

describe('BitriseYmlStore — modular tree', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    init();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initializeModularConfig', () => {
    it('flattens the tree into file slices keyed by node_id', () => {
      const { files } = bitriseYmlStore.getState();
      expect(Object.keys(files).sort()).toEqual(['child-a', 'child-b', 'readonly', 'root']);
      expect(files.readonly.editable).toBe(false);
      expect(files['child-a'].path).toBe('child-a.yml');
    });

    it('seeds selection, the root tab, branch/commit and the entity index', () => {
      const state = bitriseYmlStore.getState();
      expect(state.selectedNodeId).toBe('root');
      expect(state.openTabs).toEqual([{ nodeId: 'root', isPreview: false }]);
      expect(state.configBranch).toBe('main');
      expect(state.configCommitSha).toBe('abc');
      expect(state.entityIndex).toBe(entityIndex);
      expect(state.mergedYmlStale).toBe(true);
    });

    it('leaves the merged config stale when no initial mergedYml is provided', () => {
      const state = bitriseYmlStore.getState();
      expect(state.mergedYml).toBeUndefined();
      expect(state.mergedYmlStale).toBe(true);
    });

    it('seeds the merged config (not stale) when the bootstrap response carries mergedYml', () => {
      initializeModularConfig({
        root: buildRoot(),
        entityIndex,
        mergedYml: 'merged: bootstrap',
        branch: 'main',
        commitSha: 'abc',
      });

      const state = bitriseYmlStore.getState();
      expect(state.mergedYml).toBe('merged: bootstrap');
      expect(state.mergedYmlStale).toBe(false);
    });
  });

  describe('updateFileDocument', () => {
    it('mutates only the targeted file document', () => {
      updateFileDocument('child-a', ({ doc }) => {
        YmlUtils.setIn(doc, ['workflows', 'child-a', 'title'], 'Edited');
        return doc;
      });

      const { files } = bitriseYmlStore.getState();
      expect(YmlUtils.toJSON(files['child-a'].ymlDocument)).toMatchObject({
        workflows: { 'child-a': { title: 'Edited' } },
      });
    });

    it('preserves sibling Document identity so their WeakMap caches survive (regression)', () => {
      const before = bitriseYmlStore.getState().files;
      const siblingDocBefore = before['child-b'].ymlDocument;
      const siblingSavedBefore = before['child-b'].savedYmlDocument;
      const readonlyDocBefore = before.readonly.ymlDocument;

      // Prime the collectPaths WeakMap cache against the sibling's document.
      const cachedPaths = YmlUtils.collectPaths(siblingDocBefore);

      updateFileDocument('child-a', ({ doc }) => {
        YmlUtils.setIn(doc, ['workflows', 'child-a', 'title'], 'Edited');
        return doc;
      });

      const after = bitriseYmlStore.getState().files;
      // Touched file: new document object.
      expect(after['child-a'].ymlDocument).not.toBe(before['child-a'].ymlDocument);
      // Siblings: same document object identity → cache key still valid.
      expect(after['child-b'].ymlDocument).toBe(siblingDocBefore);
      expect(after['child-b'].savedYmlDocument).toBe(siblingSavedBefore);
      expect(after.readonly.ymlDocument).toBe(readonlyDocBefore);
      expect(YmlUtils.collectPaths(after['child-b'].ymlDocument)).toBe(cachedPaths);
    });

    it('marks the merged config stale', () => {
      setMergedConfig('merged: yaml');
      expect(bitriseYmlStore.getState().mergedYmlStale).toBe(false);

      updateFileDocument('child-a', ({ doc }) => doc);
      expect(bitriseYmlStore.getState().mergedYmlStale).toBe(true);
    });

    it('no-ops and warns for a read-only file', () => {
      const before = bitriseYmlStore.getState().files.readonly.ymlDocument;
      updateFileDocument('readonly', ({ doc }) => {
        YmlUtils.setIn(doc, ['workflows', 'x'], {});
        return doc;
      });

      expect(bitriseYmlStore.getState().files.readonly.ymlDocument).toBe(before);
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('read-only'));
    });

    it('no-ops and warns for an unknown node_id', () => {
      updateFileDocument('missing', ({ doc }) => doc);
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('no file with node_id'));
    });
  });

  describe('tabs', () => {
    it('opens a file as a preview tab that replaces a previous non-dirty preview', () => {
      openTab('child-a');
      openTab('child-b');

      const { openTabs, selectedNodeId } = bitriseYmlStore.getState();
      // root (permanent) + child-b (preview); child-a's preview was replaced.
      expect(openTabs).toEqual([
        { nodeId: 'root', isPreview: false },
        { nodeId: 'child-b', isPreview: true },
      ]);
      expect(selectedNodeId).toBe('child-b');
    });

    it('keeps a dirty preview tab when opening another file', () => {
      openTab('child-a');
      updateFileDocument('child-a', ({ doc }) => {
        YmlUtils.setIn(doc, ['workflows', 'child-a', 'title'], 'Edited');
        return doc;
      });
      openTab('child-b');

      const { openTabs } = bitriseYmlStore.getState();
      expect(openTabs.map((t) => t.nodeId)).toEqual(['root', 'child-a', 'child-b']);
      // child-a was promoted to permanent by the edit.
      expect(openTabs.find((t) => t.nodeId === 'child-a')?.isPreview).toBe(false);
    });

    it('selects a neighbor when the active tab is closed', () => {
      openTab('child-a', { preview: false });
      openTab('child-b', { preview: false });
      selectNode('child-a');

      closeTab('child-a');

      const { openTabs, selectedNodeId, ymlDocument, savedYmlDocument, version, files } = bitriseYmlStore.getState();
      expect(openTabs.map((t) => t.nodeId)).toEqual(['root', 'child-b']);
      expect(selectedNodeId).toBe('child-b');
      // The active editing document must rebind to the neighbor — selecting
      // without rebinding would leave the content window on the closed file.
      expect(ymlDocument).toBe(files['child-b'].ymlDocument);
      expect(savedYmlDocument).toBe(files['child-b'].savedYmlDocument);
      expect(version).toBe(files['child-b'].version);
    });

    it('does not change the active document when closing an inactive tab', () => {
      openTab('child-a', { preview: false });
      openTab('child-b', { preview: false });
      selectNode('child-a');

      closeTab('child-b');

      const { selectedNodeId, ymlDocument, files } = bitriseYmlStore.getState();
      expect(selectedNodeId).toBe('child-a');
      expect(ymlDocument).toBe(files['child-a'].ymlDocument);
    });

    it('falls back to the merged config tab when the last tab is closed', () => {
      closeTab('root');
      expect(bitriseYmlStore.getState().selectedNodeId).toBe(MERGED_CONFIG_NODE_ID);
    });

    it('binds the active document to the merged config when the last tab is closed', () => {
      // Otherwise the views keep rendering the just-closed file, where other
      // files' entities look like cross-file ghosts.
      const merged = 'format_version: "13"\nworkflows:\n  child-a: {}\n  defined-elsewhere: {}\n';
      initializeModularConfig({ root: buildRoot(), entityIndex, mergedYml: merged, branch: 'main' });

      closeTab('root');

      const state = bitriseYmlStore.getState();
      expect(state.selectedNodeId).toBe(MERGED_CONFIG_NODE_ID);
      expect(state.yml.workflows).toMatchObject({ 'child-a': {}, 'defined-elsewhere': {} });
    });

    it('selectMergedConfig selects the reserved merged tab', () => {
      selectMergedConfig();
      expect(bitriseYmlStore.getState().selectedNodeId).toBe(MERGED_CONFIG_NODE_ID);
    });

    it('records the current page on the active tab so it can be restored on re-select', () => {
      openTab('child-a', { preview: false });

      recordActiveTabLocation('#!/workflows?workflow_id=foo');

      const tab = bitriseYmlStore.getState().openTabs.find((t) => t.nodeId === 'child-a');
      expect(tab?.lastLocation).toBe('#!/workflows?workflow_id=foo');
      // Other tabs are untouched.
      expect(bitriseYmlStore.getState().openTabs.find((t) => t.nodeId === 'root')?.lastLocation).toBeUndefined();
    });

    it('records the merged tab page in mergedTabLastLocation (not on any file tab)', () => {
      selectMergedConfig();
      recordActiveTabLocation('#!/workflows?workflow_id=bar');

      const state = bitriseYmlStore.getState();
      expect(state.mergedTabLastLocation).toBe('#!/workflows?workflow_id=bar');
      // File tabs are left untouched.
      expect(state.openTabs.every((t) => t.lastLocation === undefined)).toBe(true);
    });
  });

  describe('active-file binding (whole WFE edits the active file)', () => {
    it('seeds the active document from the root file on init', () => {
      const state = bitriseYmlStore.getState();
      expect(state.yml).toMatchObject({ format_version: '13' });
      expect(state.ymlDocument).toBe(state.files.root.ymlDocument);
      expect(state.hasChanges).toBe(false);
    });

    it('routes updateBitriseYmlDocument to the active file and mirrors it into ymlDocument', () => {
      selectNode('child-a');

      updateBitriseYmlDocument(({ doc }) => {
        YmlUtils.setIn(doc, ['workflows', 'child-a', 'title'], 'Edited');
        return doc;
      });

      const state = bitriseYmlStore.getState();
      // Active document reflects the edit...
      expect(state.yml).toMatchObject({ workflows: { 'child-a': { title: 'Edited' } } });
      // ...and it was written back to the active file's slice (so the tab + save see it).
      expect(YmlUtils.toJSON(state.files['child-a'].ymlDocument)).toMatchObject({
        workflows: { 'child-a': { title: 'Edited' } },
      });
      // The other file is untouched.
      expect(YmlUtils.toJSON(state.files['child-b'].ymlDocument)).not.toMatchObject({
        workflows: { 'child-a': {} },
      });
    });

    it('marks the merged config stale on a mutator edit (so the merged view refetches)', () => {
      setMergedConfig('merged: yaml');
      expect(bitriseYmlStore.getState().mergedYmlStale).toBe(false);

      selectNode('child-a');
      updateBitriseYmlDocument(({ doc }) => {
        YmlUtils.setIn(doc, ['workflows', 'child-a', 'title'], 'Edited');
        return doc;
      });

      expect(bitriseYmlStore.getState().mergedYmlStale).toBe(true);
    });

    it('marks the merged config stale on a string edit (source-view editing)', () => {
      setMergedConfig('merged: yaml');
      expect(bitriseYmlStore.getState().mergedYmlStale).toBe(false);

      selectNode('child-a');
      updateBitriseYmlDocumentByString('workflows:\n  child-a:\n    title: From source\n');

      expect(bitriseYmlStore.getState().mergedYmlStale).toBe(true);
    });

    it('swaps the active document when switching tabs, preserving each file edits', () => {
      selectNode('child-a');
      updateBitriseYmlDocument(({ doc }) => {
        YmlUtils.setIn(doc, ['workflows', 'child-a', 'title'], 'A-edit');
        return doc;
      });

      selectNode('child-b');
      expect(bitriseYmlStore.getState().yml).toMatchObject({ workflows: { 'child-b': {} } });
      expect(bitriseYmlStore.getState().yml).not.toMatchObject({ workflows: { 'child-a': {} } });

      // Switching back shows the earlier edit, not a stale copy.
      selectNode('child-a');
      expect(bitriseYmlStore.getState().yml).toMatchObject({ workflows: { 'child-a': { title: 'A-edit' } } });
    });

    it('reports hasChanges tree-wide even when the dirty file is not the active tab', () => {
      selectNode('child-a');
      updateBitriseYmlDocument(({ doc }) => {
        YmlUtils.setIn(doc, ['workflows', 'child-a', 'title'], 'A-edit');
        return doc;
      });
      selectNode('child-b'); // active file is clean, but child-a is dirty

      expect(bitriseYmlStore.getState().hasChanges).toBe(true);
    });

    it('no-ops updateBitriseYmlDocument when the active file is read-only', () => {
      selectNode('readonly');
      const before = bitriseYmlStore.getState().ymlDocument;

      updateBitriseYmlDocument(({ doc }) => {
        YmlUtils.setIn(doc, ['workflows', 'x'], {});
        return doc;
      });

      expect(bitriseYmlStore.getState().ymlDocument).toBe(before);
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('read-only'));
    });

    it('discards edits across all files and rebinds the active document', () => {
      selectNode('child-a');
      updateBitriseYmlDocument(({ doc }) => {
        YmlUtils.setIn(doc, ['workflows', 'child-a', 'title'], 'A-edit');
        return doc;
      });
      selectNode('child-b');
      updateBitriseYmlDocument(({ doc }) => {
        YmlUtils.setIn(doc, ['workflows', 'child-b', 'title'], 'B-edit');
        return doc;
      });

      discardBitriseYmlDocument();

      const state = bitriseYmlStore.getState();
      expect(state.hasChanges).toBe(false);
      expect(YmlUtils.toJSON(state.files['child-a'].ymlDocument)).not.toMatchObject({
        workflows: { 'child-a': { title: 'A-edit' } },
      });
      // Active document (child-b) is reverted too.
      expect(state.yml).not.toMatchObject({ workflows: { 'child-b': { title: 'B-edit' } } });
    });

    it('marks the merged config stale on discard so the merged view reloads to the original', () => {
      selectNode('child-a');
      updateBitriseYmlDocument(({ doc }) => {
        YmlUtils.setIn(doc, ['workflows', 'child-a', 'title'], 'A-edit');
        return doc;
      });
      setMergedConfig('merged: with-edits');
      expect(bitriseYmlStore.getState().mergedYmlStale).toBe(false);

      discardBitriseYmlDocument();

      expect(bitriseYmlStore.getState().mergedYmlStale).toBe(true);
    });
  });

  describe('merged config view binding', () => {
    const MERGED = 'format_version: "13"\nworkflows:\n  child-a: {}\n  defined-elsewhere: {}\n';

    it('binds the active document to the merged config so every entity resolves locally', () => {
      initializeModularConfig({ root: buildRoot(), entityIndex, mergedYml: MERGED, branch: 'main' });

      selectMergedConfig();

      const state = bitriseYmlStore.getState();
      expect(state.selectedNodeId).toBe(MERGED_CONFIG_NODE_ID);
      // The whole config is now the active document → cross-file entities are
      // present locally (no ghosts).
      expect(state.yml.workflows).toMatchObject({ 'child-a': {}, 'defined-elsewhere': {} });
    });

    it('is read-only on the merged tab (no file slice backs it → mutations no-op)', () => {
      initializeModularConfig({ root: buildRoot(), entityIndex, mergedYml: MERGED, branch: 'main' });
      selectMergedConfig();
      const before = bitriseYmlStore.getState().ymlDocument;

      updateBitriseYmlDocument(({ doc }) => {
        YmlUtils.setIn(doc, ['workflows', 'child-a', 'title'], 'Nope');
        return doc;
      });

      expect(bitriseYmlStore.getState().ymlDocument).toBe(before);
    });

    it('rebinds the active document when a fresh merge arrives while the merged tab is active', () => {
      initializeModularConfig({ root: buildRoot(), entityIndex, mergedYml: MERGED, branch: 'main' });
      selectMergedConfig();

      setMergedConfig('format_version: "13"\nworkflows:\n  only-after-refresh: {}\n');

      expect(bitriseYmlStore.getState().yml.workflows).toMatchObject({ 'only-after-refresh': {} });
    });
  });

  describe('getModularConfigTree', () => {
    it('rebuilds the full tree with live contents from every file', () => {
      updateFileDocument('child-a', ({ doc }) => {
        YmlUtils.setIn(doc, ['workflows', 'child-a', 'title'], 'Edited');
        return doc;
      });

      const tree = getModularConfigTree();
      const childA = tree?.includes.find((n) => n.nodeId === 'child-a');
      expect(childA?.contents).toContain('Edited');
      // Read-only and untouched nodes are still present in the payload.
      expect(tree?.includes.map((n) => n.nodeId).sort()).toEqual(['child-a', 'child-b', 'readonly']);
    });
  });

  describe('applyModularSaveResult', () => {
    it('refreshes files + index while preserving valid tabs and selection', () => {
      openTab('child-a', { preview: false });
      selectNode('child-a');

      const refreshed = node('root', {
        path: 'bitrise.yml',
        contents: 'format_version: "13"\n',
        version: 'v2-root',
        includes: [node('child-a', { version: 'v2-child-a' })],
      });

      applyModularSaveResult({
        root: refreshed,
        entityIndex: { workflows: {}, pipelines: {}, stepBundles: {} },
      });

      const state = bitriseYmlStore.getState();
      expect(state.files['child-a'].version).toBe('v2-child-a');
      // child-b/readonly are gone now; their tabs are dropped, child-a kept.
      expect(state.openTabs.map((t) => t.nodeId)).toEqual(['root', 'child-a']);
      expect(state.selectedNodeId).toBe('child-a');
    });

    it('resets selection to root when the selected node disappears', () => {
      openTab('child-b', { preview: false });
      selectNode('child-b');

      applyModularSaveResult({
        root: node('root', { path: 'bitrise.yml', includes: [] }),
        entityIndex: { workflows: {}, pipelines: {}, stepBundles: {} },
      });

      const state = bitriseYmlStore.getState();
      expect(state.openTabs.map((t) => t.nodeId)).toEqual(['root']);
      expect(state.selectedNodeId).toBe('root');
    });
  });
});
