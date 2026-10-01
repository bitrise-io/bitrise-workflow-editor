import {
  bitriseYmlStore,
  discardBitriseYmlDocument,
  getYmlString,
  initializeBitriseYmlDocument,
  updateBitriseYmlDocumentByString,
} from './BitriseYmlStore';

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
});
