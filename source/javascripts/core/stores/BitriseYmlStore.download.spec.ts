import { TreeNode } from '@/core/models/Tree';
import YmlUtils from '@/core/utils/YmlUtils';

import {
  bitriseYmlStore,
  getUnsavedConfigFiles,
  hasYmlChanges,
  initializeBitriseYmlDocument,
  initializeModularConfig,
  selectNode,
  updateBitriseYmlDocument,
  updateBitriseYmlDocumentByString,
  updateFileDocumentByString,
} from './BitriseYmlStore';

const YML = 'workflows:\n  primary: {}\n';
const EDITED_YML = 'workflows:\n  primary: {}\n  deploy: {}\n';
const UNPARSEABLE_YML = 'workflows:\n  primary: {\n';
const OTHER_UNPARSEABLE_YML = 'workflows:\n  deploy: {\n';

function node(nodeId: string, path: string, contents: string, overrides: Partial<TreeNode> = {}): TreeNode {
  return { nodeId, path, contents, source: null, commitSha: 'sha', editable: true, includes: [], ...overrides };
}

const ROOT_YML = 'include:\n- path: modules/a.yml\n- path: modules/b.yml\n';
const A_YML = 'workflows:\n  a: {}\n';
const B_YML = 'workflows:\n  b: {}\n';

function initModular(bYml = B_YML) {
  initializeModularConfig({
    root: node('root', 'bitrise.yml', ROOT_YML, {
      includes: [node('a', 'modules/a.yml', A_YML), node('b', 'modules/b.yml', bYml)],
    }),
    mergedYml: `${A_YML}${B_YML}`,
  });
}

describe('getUnsavedConfigFiles', () => {
  describe('single-file config', () => {
    it('offers nothing before a configuration has loaded', () => {
      initializeBitriseYmlDocument({ ymlString: '', version: '' });

      expect(getUnsavedConfigFiles()).toEqual([]);
    });

    it('offers nothing when nothing changed', () => {
      initializeBitriseYmlDocument({ ymlString: YML, version: '' });

      expect(getUnsavedConfigFiles()).toEqual([]);
    });

    it('offers the edited document after a string edit', () => {
      initializeBitriseYmlDocument({ ymlString: YML, version: '' });
      updateBitriseYmlDocumentByString(EDITED_YML);

      expect(getUnsavedConfigFiles()).toEqual([{ path: 'bitrise.yml', content: EDITED_YML }]);
    });

    it('offers the edited document after a structured edit', () => {
      initializeBitriseYmlDocument({ ymlString: YML, version: '' });
      updateBitriseYmlDocument(({ doc }) => {
        YmlUtils.setIn(doc, ['workflows', 'deploy'], {});
        return doc;
      });

      expect(getUnsavedConfigFiles()).toEqual([{ path: 'bitrise.yml', content: EDITED_YML }]);
    });

    it('offers the latest version that parses while the pending edit does not parse', () => {
      initializeBitriseYmlDocument({ ymlString: YML, version: '' });
      updateBitriseYmlDocumentByString(EDITED_YML);
      updateBitriseYmlDocumentByString(UNPARSEABLE_YML);

      expect(getUnsavedConfigFiles()).toEqual([{ path: 'bitrise.yml', content: EDITED_YML }]);
    });

    it('counts an unparseable edit as unsaved even when the parsed document still matches the saved one', () => {
      initializeBitriseYmlDocument({ ymlString: YML, version: '' });
      updateBitriseYmlDocumentByString(UNPARSEABLE_YML);

      expect(getUnsavedConfigFiles()).toEqual([{ path: 'bitrise.yml', content: YML }]);
    });

    it('offers nothing when the config never parsed and nothing was typed since', () => {
      initializeBitriseYmlDocument({ ymlString: UNPARSEABLE_YML, version: '' });

      expect(getUnsavedConfigFiles()).toEqual([]);
    });

    it('offers the pending text when the config never parsed and the user typed another edit', () => {
      initializeBitriseYmlDocument({ ymlString: UNPARSEABLE_YML, version: '' });
      updateBitriseYmlDocumentByString(OTHER_UNPARSEABLE_YML);

      expect(getUnsavedConfigFiles()).toEqual([{ path: 'bitrise.yml', content: OTHER_UNPARSEABLE_YML }]);
    });

    it('agrees with the Save button when the user types back the unparseable text that was saved', () => {
      initializeBitriseYmlDocument({ ymlString: UNPARSEABLE_YML, version: '' });
      updateBitriseYmlDocumentByString(YML);
      updateBitriseYmlDocumentByString(UNPARSEABLE_YML);

      expect(hasYmlChanges(bitriseYmlStore.getState())).toBe(false);
      expect(getUnsavedConfigFiles()).toEqual([]);
    });
  });

  describe('modular config', () => {
    it('offers nothing when nothing changed', () => {
      initModular();

      expect(getUnsavedConfigFiles()).toEqual([]);
    });

    it('offers only the edited file, by its path, when it is not the active tab', () => {
      initModular();
      updateFileDocumentByString('b', `${B_YML}  deploy: {}\n`);

      expect(getUnsavedConfigFiles()).toEqual([{ path: 'modules/b.yml', content: `${B_YML}  deploy: {}\n` }]);
    });

    it('offers every edited file', () => {
      initModular();
      updateFileDocumentByString('a', `${A_YML}  deploy: {}\n`);
      updateFileDocumentByString('b', `${B_YML}  deploy: {}\n`);

      expect(getUnsavedConfigFiles().map((file) => file.path)).toEqual(['modules/a.yml', 'modules/b.yml']);
    });

    it('offers the active file at its latest parseable version while its pending edit does not parse', () => {
      initModular();
      selectNode('a');
      updateBitriseYmlDocumentByString(`${A_YML}  deploy: {}\n`);
      updateBitriseYmlDocumentByString(UNPARSEABLE_YML);

      expect(getUnsavedConfigFiles()).toEqual([{ path: 'modules/a.yml', content: `${A_YML}  deploy: {}\n` }]);
    });

    it('counts an unparseable edit against the active file only', () => {
      initModular();
      selectNode('b');
      updateBitriseYmlDocumentByString(UNPARSEABLE_YML);

      expect(getUnsavedConfigFiles()).toEqual([{ path: 'modules/b.yml', content: B_YML }]);
    });

    it('offers the pending text for a module that never parsed and got another edit', () => {
      initModular(UNPARSEABLE_YML);
      selectNode('b');
      updateBitriseYmlDocumentByString(OTHER_UNPARSEABLE_YML);

      expect(getUnsavedConfigFiles()).toEqual([{ path: 'modules/b.yml', content: OTHER_UNPARSEABLE_YML }]);
    });
  });
});
