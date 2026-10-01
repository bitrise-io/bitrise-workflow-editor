import YmlUtils from '@/core/utils/YmlUtils';

import {
  bitriseYmlStore,
  discardBitriseYmlDocument,
  getYmlString,
  initializeBitriseYmlDocument,
  updateBitriseYmlDocument,
  updateBitriseYmlDocumentByString,
  YamlMutator,
} from './BitriseYmlStore';

const addWorkflow: YamlMutator = ({ doc }) => {
  YmlUtils.setIn(doc, ['workflows', 'added'], {});
  return doc;
};

describe('BitriseYmlStore — single file', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    initializeBitriseYmlDocument({ ymlString: 'workflows:\n  kept: {}\n', version: '1' });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('YAML that does not parse', () => {
    const typed = 'workflows:\n  kept: [\n';

    it('is kept as typed, counts as a change, and stops counting once the saved text is back', () => {
      updateBitriseYmlDocumentByString(typed);

      expect(getYmlString()).toBe(typed);
      expect(bitriseYmlStore.getState().hasChanges).toBe(true);

      updateBitriseYmlDocumentByString('workflows:\n  kept: {}\n');
      expect(bitriseYmlStore.getState().hasChanges).toBe(false);
    });

    it('leaves the pages on the last version that parsed while typing', () => {
      updateBitriseYmlDocumentByString(typed);

      expect(bitriseYmlStore.getState().yml).toEqual({ workflows: { kept: {} } });
    });

    it('reads as empty for the pages when the config is loaded with parse errors', () => {
      initializeBitriseYmlDocument({ ymlString: 'workflows:\n  kept: *missing\n', version: '1' });

      expect(bitriseYmlStore.getState().yml).toEqual({});
    });

    it('is discarded back to the saved text', () => {
      updateBitriseYmlDocumentByString(typed);

      discardBitriseYmlDocument();

      expect(getYmlString()).toBe('workflows:\n  kept: {}\n');
    });
  });

  describe('updateBitriseYmlDocument', () => {
    it('refuses a service write while typed YAML does not parse, so the typed text is kept', () => {
      const typed = 'workflows:\n  kept: [\n';
      updateBitriseYmlDocumentByString(typed);
      const before = bitriseYmlStore.getState().ymlDocument;

      updateBitriseYmlDocument(addWorkflow);

      expect(getYmlString()).toBe(typed);
      expect(bitriseYmlStore.getState().ymlDocument).toBe(before);
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("doesn't parse"));
    });

    it('refuses a service write to a config loaded with parse errors, so its text is kept', () => {
      const broken = 'workflows:\n  kept: {}\nbad: *missing\n';
      initializeBitriseYmlDocument({ ymlString: broken, version: '1' });
      const before = bitriseYmlStore.getState().ymlDocument;

      updateBitriseYmlDocument(addWorkflow);

      expect(getYmlString()).toBe(broken);
      expect(bitriseYmlStore.getState().ymlDocument).toBe(before);
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("doesn't parse"));
    });

    it('writes once the YAML parses again', () => {
      updateBitriseYmlDocumentByString('workflows:\n  kept: [\n');
      updateBitriseYmlDocumentByString('workflows:\n  kept: {}\n');

      updateBitriseYmlDocument(addWorkflow);

      expect(YmlUtils.toJSON(bitriseYmlStore.getState().ymlDocument)).toEqual({ workflows: { kept: {}, added: {} } });
    });
  });
});
