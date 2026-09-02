import ConfigLoadTracker from './ConfigLoadTracker';

describe('ConfigLoadTracker', () => {
  beforeEach(() => ConfigLoadTracker.reset());

  describe('shouldLoad', () => {
    it('loads on first call', () => {
      expect(ConfigLoadTracker.shouldLoad(undefined)).toBe(true);
    });

    it('does not load again after the same branch was loaded', () => {
      ConfigLoadTracker.markLoaded(undefined);

      expect(ConfigLoadTracker.shouldLoad(undefined)).toBe(false);
    });

    it('loads again when a different branch is requested', () => {
      ConfigLoadTracker.markLoaded('master');

      expect(ConfigLoadTracker.shouldLoad('feature')).toBe(true);
    });

    it('distinguishes "never loaded" from "loaded with no branch"', () => {
      // `null` (initial) must not compare equal to an `undefined` requested branch,
      // or the very first load would be skipped.
      expect(ConfigLoadTracker.shouldLoad(undefined)).toBe(true);

      ConfigLoadTracker.markLoaded(undefined);

      expect(ConfigLoadTracker.shouldLoad(undefined)).toBe(false);
    });
  });

  describe('claimRoutePreload', () => {
    it('is claimable exactly once', () => {
      expect(ConfigLoadTracker.claimRoutePreload()).toBe(true);
      expect(ConfigLoadTracker.claimRoutePreload()).toBe(false);
    });
  });

  describe('claimBranchLoadTracking', () => {
    it('is claimable exactly once, so a remount cannot double-count the event', () => {
      expect(ConfigLoadTracker.claimBranchLoadTracking()).toBe(true);
      expect(ConfigLoadTracker.claimBranchLoadTracking()).toBe(false);
    });

    it('is independent of the route preload claim', () => {
      ConfigLoadTracker.claimRoutePreload();

      expect(ConfigLoadTracker.claimBranchLoadTracking()).toBe(true);
    });
  });
});
