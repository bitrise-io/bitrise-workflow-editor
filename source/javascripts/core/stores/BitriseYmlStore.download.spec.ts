import { TreeNode } from '@/core/models/Tree';
import YmlUtils from '@/core/utils/YmlUtils';

import {
  getConfigFilesForDownload,
  initializeBitriseYmlDocument,
  initializeModularConfig,
  openTab,
  selectNode,
  updateBitriseYmlDocument,
  updateBitriseYmlDocumentByString,
  updateFileDocumentByString,
} from './BitriseYmlStore';

const YML = 'workflows:\n  primary: {}\n';
const EDITED_YML = 'workflows:\n  primary: {}\n  deploy: {}\n';
const UNPARSEABLE_YML = 'workflows:\n  primary: {\n';

function node(nodeId: string, path: string, contents: string, overrides: Partial<TreeNode> = {}): TreeNode {
  return { nodeId, path, contents, source: null, commitSha: 'sha', editable: true, includes: [], ...overrides };
}

const ROOT_YML = 'include:\n- path: modules/a.yml\n- path: modules/b.yml\n';
const A_YML = 'workflows:\n  a: {}\n';
const B_YML = 'workflows:\n  b: {}\n';

function initModular() {
  initializeModularConfig({
    root: node('root', 'bitrise.yml', ROOT_YML, {
      includes: [node('a', 'modules/a.yml', A_YML), node('b', 'modules/b.yml', B_YML)],
    }),
    mergedYml: `${A_YML}${B_YML}`,
  });
}

describe('getConfigFilesForDownload', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('single-file config', () => {
    it('offers nothing before a configuration has loaded', () => {
      initializeBitriseYmlDocument({ ymlString: '', version: '' });

      expect(getConfigFilesForDownload()).toEqual([]);
    });

    it('offers bitrise.yml as loaded, not flagged, when nothing changed', () => {
      initializeBitriseYmlDocument({ ymlString: YML, version: '' });

      expect(getConfigFilesForDownload()).toEqual([{ path: 'bitrise.yml', content: YML, hasUnsavedChanges: false }]);
    });

    it('offers the edited document, flagged, after a string edit', () => {
      initializeBitriseYmlDocument({ ymlString: YML, version: '' });
      updateBitriseYmlDocumentByString(EDITED_YML);

      expect(getConfigFilesForDownload()).toEqual([
        { path: 'bitrise.yml', content: EDITED_YML, hasUnsavedChanges: true },
      ]);
    });

    it('offers the edited document, flagged, after a structured edit', () => {
      initializeBitriseYmlDocument({ ymlString: YML, version: '' });
      updateBitriseYmlDocument(({ doc }) => {
        YmlUtils.setIn(doc, ['workflows', 'deploy'], {});
        return doc;
      });

      expect(getConfigFilesForDownload()).toEqual([
        { path: 'bitrise.yml', content: EDITED_YML, hasUnsavedChanges: true },
      ]);
    });

    it('offers the latest version that parses, flagged, while the pending edit does not parse', () => {
      initializeBitriseYmlDocument({ ymlString: YML, version: '' });
      updateBitriseYmlDocumentByString(EDITED_YML);
      updateBitriseYmlDocumentByString(UNPARSEABLE_YML);

      expect(getConfigFilesForDownload()).toEqual([
        { path: 'bitrise.yml', content: EDITED_YML, hasUnsavedChanges: true },
      ]);
    });

    it('flags an unparseable edit even when the parsed document still matches the saved one', () => {
      initializeBitriseYmlDocument({ ymlString: YML, version: '' });
      updateBitriseYmlDocumentByString(UNPARSEABLE_YML);

      expect(getConfigFilesForDownload()).toEqual([{ path: 'bitrise.yml', content: YML, hasUnsavedChanges: true }]);
    });
  });

  describe('modular config', () => {
    it('offers every file by its path, none flagged, when nothing changed', () => {
      initModular();

      expect(getConfigFilesForDownload()).toEqual([
        { path: 'bitrise.yml', content: ROOT_YML, hasUnsavedChanges: false },
        { path: 'modules/a.yml', content: A_YML, hasUnsavedChanges: false },
        { path: 'modules/b.yml', content: B_YML, hasUnsavedChanges: false },
      ]);
    });

    it('flags only the edited file, with its edited content, when it is not the active tab', () => {
      initModular();
      updateFileDocumentByString('b', `${B_YML}  deploy: {}\n`);

      expect(getConfigFilesForDownload()).toEqual([
        { path: 'bitrise.yml', content: ROOT_YML, hasUnsavedChanges: false },
        { path: 'modules/a.yml', content: A_YML, hasUnsavedChanges: false },
        { path: 'modules/b.yml', content: `${B_YML}  deploy: {}\n`, hasUnsavedChanges: true },
      ]);
    });

    it('flags edits in several files at once', () => {
      initModular();
      updateFileDocumentByString('a', `${A_YML}  deploy: {}\n`);
      updateFileDocumentByString('b', `${B_YML}  deploy: {}\n`);

      expect(getConfigFilesForDownload().map((file) => [file.path, file.hasUnsavedChanges])).toEqual([
        ['bitrise.yml', false],
        ['modules/a.yml', true],
        ['modules/b.yml', true],
      ]);
    });

    it('offers the active file at its latest parseable version, flagged, while its pending edit does not parse', () => {
      initModular();
      openTab('a', { preview: false });
      selectNode('a');
      updateBitriseYmlDocumentByString(`${A_YML}  deploy: {}\n`);
      updateBitriseYmlDocumentByString(UNPARSEABLE_YML);

      expect(getConfigFilesForDownload()).toEqual([
        { path: 'bitrise.yml', content: ROOT_YML, hasUnsavedChanges: false },
        { path: 'modules/a.yml', content: `${A_YML}  deploy: {}\n`, hasUnsavedChanges: true },
        { path: 'modules/b.yml', content: B_YML, hasUnsavedChanges: false },
      ]);
    });

    it('flags an unparseable edit only on the active file, even before anything in it parsed differently', () => {
      initModular();
      openTab('b', { preview: false });
      selectNode('b');
      updateBitriseYmlDocumentByString(UNPARSEABLE_YML);

      expect(getConfigFilesForDownload().map((file) => [file.path, file.hasUnsavedChanges])).toEqual([
        ['bitrise.yml', false],
        ['modules/a.yml', false],
        ['modules/b.yml', true],
      ]);
    });
  });
});
