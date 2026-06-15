import { TreeNode } from '@/core/models/Tree';
import YmlUtils from '@/core/utils/YmlUtils';

import {
  addInclude,
  applyModularSaveResult,
  bitriseYmlStore,
  closeTab,
  createFile,
  discardBitriseYmlDocument,
  getModularConfigTree,
  initializeBitriseYmlDocument,
  initializeModularConfig,
  isFileDirty,
  MERGED_CONFIG_NODE_ID,
  openTab,
  recordActiveTabLocation,
  selectMergedConfig,
  selectNode,
  setMergedConfig,
  updateBitriseYmlDocument,
  updateBitriseYmlDocumentByString,
  updateFileDocument,
  updateFileDocumentByString,
} from './BitriseYmlStore';

function node(nodeId: string, overrides: Partial<TreeNode> = {}): TreeNode {
  return {
    nodeId,
    path: `${nodeId}.yml`,
    contents: `workflows:\n  ${nodeId}: {}\n`,
    source: null,
    commitSha: 'sha',
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
  workflows: { 'child-a': [{ nodeId: 'child-a' }] },
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

  describe('createFile', () => {
    it('adds an editable file node, opens it, and binds the active document', () => {
      const result = createFile('modules/new.yml');
      expect(result).toEqual({ ok: true, nodeId: expect.stringMatching(/^n_new_/) });

      const state = bitriseYmlStore.getState();
      const nodeId = result.ok ? result.nodeId : '';
      expect(state.files[nodeId]).toMatchObject({ path: 'modules/new.yml', editable: true, commitSha: '' });
      expect(state.tree?.includes.some((node) => node.nodeId === nodeId)).toBe(true);
      expect(state.selectedNodeId).toBe(nodeId);
      expect(state.openTabs.some((tab) => tab.nodeId === nodeId && !tab.isPreview)).toBe(true);
      expect(state.mergedYmlStale).toBe(true);
    });

    it('strips a leading slash and rejects a duplicate path', () => {
      const first = createFile('/modules/dup.yml');
      expect(first.ok).toBe(true);
      const nodeId = first.ok ? first.nodeId : '';
      expect(bitriseYmlStore.getState().files[nodeId]?.path).toBe('modules/dup.yml');

      const second = createFile('modules/dup.yml');
      expect(second.ok).toBe(false);
    });

    it('rejects an empty path and a non-YAML extension', () => {
      expect(createFile('   ').ok).toBe(false);
      expect(createFile('modules/notyaml.txt').ok).toBe(false);
    });

    it('attaches the new file under its include target (not the root)', () => {
      const result = createFile('modules/under-a.yml', 'child-a');
      const nodeId = result.ok ? result.nodeId : '';
      const state = bitriseYmlStore.getState();
      expect(state.tree?.includes.some((node) => node.nodeId === nodeId)).toBe(false);
      const target = state.tree?.includes.find((node) => node.nodeId === 'child-a');
      expect(target?.includes.some((node) => node.nodeId === nodeId)).toBe(true);
    });

    it('counts as unsaved (dirty) when freshly created — never on the branch', () => {
      const result = createFile('modules/clean.yml');
      const nodeId = result.ok ? result.nodeId : '';
      const slice = bitriseYmlStore.getState().files[nodeId];
      expect(YmlUtils.isEquals(slice!.ymlDocument, slice!.savedYmlDocument)).toBe(true);
      // Equal documents but empty commitSha (not yet pushed) ⇒ still dirty.
      expect(isFileDirty(slice)).toBe(true);
      expect(bitriseYmlStore.getState().hasChanges).toBe(true);
    });

    it('marks the new file modified in the serialized tree even when untouched', () => {
      const result = createFile('modules/fresh.yml');
      const nodeId = result.ok ? result.nodeId : '';
      const wireTree = getModularConfigTree();
      const newNode = wireTree?.includes.find((node) => node.nodeId === nodeId);
      // Empty commitSha ⇒ always "modified" ⇒ the push creates it.
      expect(newNode?.modified).toBe(true);
    });
  });

  describe('addInclude', () => {
    function includeList(nodeId: string) {
      const doc = bitriseYmlStore.getState().files[nodeId]?.ymlDocument;
      return YmlUtils.getSeqIn(doc!, ['include'])?.toJSON() ?? [];
    }

    it('appends a path-only include directive to an editable file', () => {
      const result = addInclude('root', { path: 'modules/extra.yml' });
      expect(result).toEqual({ ok: true });
      expect(includeList('root')).toEqual([{ path: 'modules/extra.yml' }]);
      expect(bitriseYmlStore.getState().mergedYmlStale).toBe(true);
    });

    it('writes only the provided source refs', () => {
      addInclude('root', { path: 'shared.yml', repository: 'shared', branch: 'main', tag: '', commit: '' });
      expect(includeList('root')).toEqual([{ path: 'shared.yml', repository: 'shared', branch: 'main' }]);
    });

    it('rejects a read-only target, a missing target, and a non-YAML path', () => {
      expect(addInclude('readonly', { path: 'x.yml' }).ok).toBe(false);
      expect(addInclude('nope', { path: 'x.yml' }).ok).toBe(false);
      expect(addInclude('root', { path: 'x.txt' }).ok).toBe(false);
    });

    it('enforces the backend include rules (repo needs a ref; commit length)', () => {
      expect(addInclude('root', { path: 'x.yml', repository: 'other' }).ok).toBe(false);
      expect(addInclude('root', { path: 'x.yml', commit: 'abc' }).ok).toBe(false);
      expect(addInclude('root', { path: 'x.yml', commit: 'abcdef0' }).ok).toBe(true);
    });
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
      expect(state.mergedYmlStale).toBe(true);
      // Derived live from file documents, so it includes workflows the seed omitted (child-b, readonly).
      expect(state.entityIndex).toEqual({
        workflows: {
          'child-a': [{ nodeId: 'child-a' }],
          'child-b': [{ nodeId: 'child-b' }],
          readonly: [{ nodeId: 'readonly' }],
        },
        pipelines: {},
        stepBundles: {},
      });
    });

    it('keeps the entity index live as module files are edited (cross-file detection before save)', () => {
      updateFileDocument('child-a', ({ doc }) => {
        YmlUtils.setIn(doc, ['workflows', 'brand-new'], {});
        return doc;
      });

      const { entityIndex: index } = bitriseYmlStore.getState();
      expect(index.workflows['brand-new']).toEqual([{ nodeId: 'child-a' }]);
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

  describe('initializeBitriseYmlDocument (legacy init clears modular state)', () => {
    it('drops the tree, files, tabs and entity index when the legacy single-file init runs', () => {
      // Sanity: modular state is populated by the beforeEach init().
      expect(bitriseYmlStore.getState().tree).toBeDefined();

      initializeBitriseYmlDocument({ ymlString: 'workflows:\n  legacy: {}\n', version: '14', branch: 'main' });

      const state = bitriseYmlStore.getState();
      expect(state.tree).toBeUndefined();
      expect(state.files).toEqual({});
      expect(state.openTabs).toEqual([]);
      expect(state.selectedNodeId).toBeUndefined();
      expect(state.entityIndex).toEqual({ workflows: {}, pipelines: {}, stepBundles: {} });
      expect(state.mergedYml).toBeUndefined();
      expect(state.savedMergedYml).toBeUndefined();
      // The single-file document is now the one the editor reads.
      expect(YmlUtils.toYml(state.ymlDocument)).toContain('legacy');
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
      expect(after['child-a'].ymlDocument).not.toBe(before['child-a'].ymlDocument);
      // Siblings keep document identity → their WeakMap cache key stays valid.
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

  describe('updateFileDocumentByString', () => {
    it('applies a YAML string to a non-active file (global diff Apply)', () => {
      updateFileDocumentByString('child-a', 'workflows:\n  via-string: {}\n');

      const state = bitriseYmlStore.getState();
      expect(YmlUtils.toJSON(state.files['child-a'].ymlDocument)).toEqual({ workflows: { 'via-string': {} } });
      expect(state.selectedNodeId).toBe('root');
      expect(state.entityIndex.workflows['via-string']).toEqual([{ nodeId: 'child-a' }]);
    });

    it('keeps the active bound document in sync when the file is the active tab', () => {
      selectNode('child-a');
      updateFileDocumentByString('child-a', 'workflows:\n  active-edit: {}\n');

      const state = bitriseYmlStore.getState();
      expect(state.yml).toEqual({ workflows: { 'active-edit': {} } });
      expect(YmlUtils.toJSON(state.files['child-a'].ymlDocument)).toEqual({ workflows: { 'active-edit': {} } });
    });

    it('ignores invalid YAML for a non-active file', () => {
      const before = bitriseYmlStore.getState().files['child-a'].ymlDocument;
      updateFileDocumentByString('child-a', 'workflows: : : invalid');
      expect(bitriseYmlStore.getState().files['child-a'].ymlDocument).toBe(before);
    });
  });

  describe('tabs', () => {
    it('opens a file as a preview tab that replaces a previous non-dirty preview', () => {
      openTab('child-a');
      openTab('child-b');

      const { openTabs, selectedNodeId } = bitriseYmlStore.getState();
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

      const { openTabs, selectedNodeId, ymlDocument, savedYmlDocument, files } = bitriseYmlStore.getState();
      expect(openTabs.map((t) => t.nodeId)).toEqual(['root', 'child-b']);
      expect(selectedNodeId).toBe('child-b');
      // Active document must rebind to the neighbor, else the content window stays on the closed file.
      expect(ymlDocument).toBe(files['child-b'].ymlDocument);
      expect(savedYmlDocument).toBe(files['child-b'].savedYmlDocument);
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
      // Otherwise the views keep rendering the just-closed file, where other files' entities look like ghosts.
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
      expect(bitriseYmlStore.getState().openTabs.find((t) => t.nodeId === 'root')?.lastLocation).toBeUndefined();
    });

    it('records the merged tab page in mergedTabLastLocation (not on any file tab)', () => {
      selectMergedConfig();
      recordActiveTabLocation('#!/workflows?workflow_id=bar');

      const state = bitriseYmlStore.getState();
      expect(state.mergedTabLastLocation).toBe('#!/workflows?workflow_id=bar');
      expect(state.openTabs.every((t) => t.lastLocation === undefined)).toBe(true);
    });

    it('does not record YAML-page locations — code view is a global mode, not per-tab memory', () => {
      openTab('child-a', { preview: false });
      recordActiveTabLocation('#!/workflows?workflow_id=foo');

      recordActiveTabLocation('#!/yml');
      recordActiveTabLocation('#!/yml?branch=main');

      const tab = bitriseYmlStore.getState().openTabs.find((t) => t.nodeId === 'child-a');
      expect(tab?.lastLocation).toBe('#!/workflows?workflow_id=foo');

      selectMergedConfig();
      recordActiveTabLocation('#!/pipelines?pipeline=p1');
      recordActiveTabLocation('#!/yml');
      expect(bitriseYmlStore.getState().mergedTabLastLocation).toBe('#!/pipelines?pipeline=p1');
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
      expect(state.yml).toMatchObject({ workflows: { 'child-a': { title: 'Edited' } } });
      // Written back to the active file's slice, so the tab + save see it.
      expect(YmlUtils.toJSON(state.files['child-a'].ymlDocument)).toMatchObject({
        workflows: { 'child-a': { title: 'Edited' } },
      });
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
      expect(state.yml).not.toMatchObject({ workflows: { 'child-b': { title: 'B-edit' } } });
    });

    it('drops a session-created file (tab, tree node, slice) on discard', () => {
      const result = createFile('modules/created.yml', 'child-a');
      const nodeId = result.ok ? result.nodeId : '';
      expect(bitriseYmlStore.getState().selectedNodeId).toBe(nodeId);

      discardBitriseYmlDocument();

      const state = bitriseYmlStore.getState();
      expect(state.files[nodeId]).toBeUndefined();
      expect(state.openTabs.some((tab) => tab.nodeId === nodeId)).toBe(false);
      const target = state.tree?.includes.find((node) => node.nodeId === 'child-a');
      expect(target?.includes.some((node) => node.nodeId === nodeId)).toBe(false);
      expect(state.selectedNodeId).not.toBe(nodeId);
      expect(state.hasChanges).toBe(false);
      expect(state.entityIndex.workflows[nodeId]).toBeUndefined();
    });

    it('freezes the saved merged baseline while edits are pending, for the merged diff', () => {
      // Clean state: a merge sets both current + saved baseline.
      setMergedConfig('merged: original');
      expect(bitriseYmlStore.getState().savedMergedYml).toBe('merged: original');

      // Once dirty, a fresh merge updates current but NOT the saved baseline (diff compares saved → current).
      updateFileDocument('child-a', ({ doc }) => {
        YmlUtils.setIn(doc, ['workflows', 'child-a', 'title'], 'edited');
        return doc;
      });
      setMergedConfig('merged: with-edits');

      const state = bitriseYmlStore.getState();
      expect(state.mergedYml).toBe('merged: with-edits');
      expect(state.savedMergedYml).toBe('merged: original');
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
      expect(tree?.includes.map((n) => n.nodeId).sort()).toEqual(['child-a', 'child-b', 'readonly']);
    });

    it('flags only the changed file as modified (BE pushes editable+modified files)', () => {
      updateFileDocument('child-a', ({ doc }) => {
        YmlUtils.setIn(doc, ['workflows', 'child-a', 'title'], 'Edited');
        return doc;
      });

      const tree = getModularConfigTree();
      expect(tree?.modified).toBe(false); // root untouched
      expect(tree?.includes.find((n) => n.nodeId === 'child-a')?.modified).toBe(true);
      expect(tree?.includes.find((n) => n.nodeId === 'child-b')?.modified).toBe(false);
    });
  });

  describe('applyModularSaveResult', () => {
    it('refreshes files + index while preserving valid tabs and selection', () => {
      openTab('child-a', { preview: false });
      selectNode('child-a');

      const refreshed = node('root', {
        path: 'bitrise.yml',
        contents: 'format_version: "13"\n',
        commitSha: 'sha2',
        includes: [node('child-a', { commitSha: 'sha2' })],
      });

      applyModularSaveResult({
        root: refreshed,
        entityIndex: { workflows: {}, pipelines: {}, stepBundles: {} },
      });

      const state = bitriseYmlStore.getState();
      expect(state.files['child-a'].commitSha).toBe('sha2');
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

    it('preserves the Merged-config selection + open tabs across the reload (push-to-branch)', () => {
      openTab('child-a', { preview: false });
      selectMergedConfig();

      applyModularSaveResult({
        root: buildRoot(),
        entityIndex: { workflows: {}, pipelines: {}, stepBundles: {} },
        branch: 'feature-x',
        commitSha: 'pushed-sha',
      });

      const state = bitriseYmlStore.getState();
      expect(state.selectedNodeId).toBe(MERGED_CONFIG_NODE_ID);
      expect(state.openTabs.map((t) => t.nodeId)).toContain('child-a');
      expect(state.configBranch).toBe('feature-x');
      expect(state.configCommitSha).toBe('pushed-sha');
      // Stale so useMergedConfigSync refetches + rebinds the merged view.
      expect(state.mergedYmlStale).toBe(true);
    });
  });
});
