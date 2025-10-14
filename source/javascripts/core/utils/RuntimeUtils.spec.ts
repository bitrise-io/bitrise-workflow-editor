/**
 * @jest-environment jsdom
 */

import RuntimeUtils from './RuntimeUtils';

describe('RuntimeUtils', () => {
  beforeAll(() => {
    (window as any).env = { MODE: 'WEBSITE' };
  });

  describe('isWebsiteMode', () => {
    it('should return true if MODE is WEBSITE', () => {
      window.env.MODE = 'WEBSITE';
      expect(RuntimeUtils.isWebsiteMode()).toBe(true);
    });

    it('should return false if MODE is CLI', () => {
      window.env.MODE = 'CLI';
      expect(RuntimeUtils.isWebsiteMode()).toBe(false);
    });
  });

  describe('isLocalMode', () => {
    it('should return true if MODE is CLI', () => {
      window.env.MODE = 'CLI';
      expect(RuntimeUtils.isLocalMode()).toBe(true);
    });

    it('should return false if MODE is WEBSITE', () => {
      window.env.MODE = 'WEBSITE';
      expect(RuntimeUtils.isLocalMode()).toBe(false);
    });
  });
});
