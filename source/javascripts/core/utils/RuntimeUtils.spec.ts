import RuntimeUtils from './RuntimeUtils';

describe('RuntimeUtils', () => {
  describe('isWebsiteMode', () => {
    it('should return true if MODE is website', () => {
      process.env.MODE = 'website';
      expect(RuntimeUtils.isWebsiteMode()).toBe(true);
    });

    it('should return true if MODE is WEBSITE (case insensitive)', () => {
      process.env.MODE = 'WEBSITE';
      expect(RuntimeUtils.isWebsiteMode()).toBe(true);
    });

    it('should return false if MODE is cli', () => {
      process.env.MODE = 'cli';
      expect(RuntimeUtils.isWebsiteMode()).toBe(false);
    });

    it('should return false if MODE is CLI (case insensitive)', () => {
      process.env.MODE = 'CLI';
      expect(RuntimeUtils.isWebsiteMode()).toBe(false);
    });

    it('should return false if MODE is random', () => {
      process.env.MODE = 'random';
      expect(RuntimeUtils.isWebsiteMode()).toBe(false);
    });

    it('should return false if MODE is RANDOM', () => {
      process.env.MODE = 'RANDOM';
      expect(RuntimeUtils.isWebsiteMode()).toBe(false);
    });

    it('should return false if MODE is undefined', () => {
      delete process.env.MODE;
      expect(RuntimeUtils.isWebsiteMode()).toBe(false);
    });
  });

  describe('isLocalMode', () => {
    it('should return true if MODE is cli', () => {
      process.env.MODE = 'cli';
      expect(RuntimeUtils.isLocalMode()).toBe(true);
    });

    it('should return true if MODE is CLI (case insensitive)', () => {
      process.env.MODE = 'CLI';
      expect(RuntimeUtils.isLocalMode()).toBe(true);
    });

    it('should return false if MODE is website', () => {
      process.env.MODE = 'website';
      expect(RuntimeUtils.isLocalMode()).toBe(false);
    });

    it('should return false if MODE is WEBSITE', () => {
      process.env.MODE = 'WEBSITE';
      expect(RuntimeUtils.isLocalMode()).toBe(false);
    });

    it('should return true if MODE is random', () => {
      process.env.MODE = 'random';
      expect(RuntimeUtils.isLocalMode()).toBe(true);
    });

    it('should return true if MODE is RANDOM', () => {
      process.env.MODE = 'RANDOM';
      expect(RuntimeUtils.isLocalMode()).toBe(true);
    });

    it('should return true if MODE is undefined', () => {
      delete process.env.MODE;
      expect(RuntimeUtils.isLocalMode()).toBe(true);
    });
  });
});
