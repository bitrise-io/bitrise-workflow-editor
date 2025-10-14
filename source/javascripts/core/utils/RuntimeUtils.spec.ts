/**
 * @jest-environment jsdom
 */

import RuntimeUtils from './RuntimeUtils';

describe('RuntimeUtils', () => {
  beforeAll(() => {
    // Egyszerű hozzárendelés, így írható marad
    (window as any).env = { MODE: 'website' };
  });

  describe('isWebsiteMode', () => {
    it('should return true if MODE is website', () => {
      window.env.MODE = 'website';
      expect(RuntimeUtils.isWebsiteMode()).toBe(true);
    });

    it('should return false if MODE is cli', () => {
      window.env.MODE = 'cli';
      expect(RuntimeUtils.isWebsiteMode()).toBe(false);
    });
  });

  describe('isLocalMode', () => {
    it('should return true if MODE is cli', () => {
      window.env.MODE = 'cli';
      expect(RuntimeUtils.isLocalMode()).toBe(true);
    });

    it('should return false if MODE is website', () => {
      window.env.MODE = 'website';
      expect(RuntimeUtils.isLocalMode()).toBe(false);
    });
  });
});
