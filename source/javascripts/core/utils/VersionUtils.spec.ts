import VersionUtils from './VersionUtils';

describe('VersionUtils', () => {
  describe('normalizeVersion', () => {
    it('should return the exact version as is', () => {
      expect(VersionUtils.normalizeVersion('1.2.3')).toBe('1.2.3');
    });

    it('should normalize version with major.minor', () => {
      expect(VersionUtils.normalizeVersion('1.2')).toBe('1.2.x');
    });

    it('should normalize version with major only', () => {
      expect(VersionUtils.normalizeVersion('1')).toBe('1.x.x');
    });

    it('should return empty string if version is undefined', () => {
      expect(VersionUtils.normalizeVersion(undefined)).toBe('');
    });

    it('should return the same version if it does not match the pattern', () => {
      expect(VersionUtils.normalizeVersion('master')).toBe('master');
    });
  });

  describe('denormalizeVersion', () => {
    it('should return the same version if an exact version is given', () => {
      expect(VersionUtils.denormalizeVersion('1.2.3')).toBe('1.2.3');
    });

    it('should return major.minor if major.minor.x is given', () => {
      expect(VersionUtils.denormalizeVersion('1.2.x')).toBe('1.2');
    });

    it('should return major if major.x.x is given', () => {
      expect(VersionUtils.denormalizeVersion('1.x.x')).toBe('1');
    });

    it('should return major if major.x is given', () => {
      expect(VersionUtils.denormalizeVersion('1.x')).toBe('1');
    });

    it('should return the same version if a none semver version is given', () => {
      expect(VersionUtils.denormalizeVersion('master')).toBe('master');
    });

    it('should return an empty string if an empty string is given', () => {
      expect(VersionUtils.denormalizeVersion('')).toBe('');
    });

    it('should return an empty string if undefined is given', () => {
      expect(VersionUtils.denormalizeVersion(undefined)).toBe('');
    });
  });

  describe('getNormalizedVersions', () => {
    it('should return normalized versions', () => {
      expect(VersionUtils.getNormalizedVersions(['1.2.3', '1.3.0', '1.2.4', '2.3.4', '2.4.5'])).toEqual([
        '2.4.x',
        '2.3.x',
        '2.x.x',
        '1.3.x',
        '1.2.x',
        '1.x.x',
      ]);
    });

    it('should return an empty array if versions is undefined', () => {
      expect(VersionUtils.getNormalizedVersions(undefined)).toEqual([]);
    });
  });

  describe('resolveVersion', () => {
    it('should return exact version, if exact version is given', () => {
      expect(VersionUtils.resolveVersion('1.2.3', ['1.2.3', '1.2.7', '1.3.0', '2.0.0'])).toBe('1.2.3');
    });

    it('should return the max satisfying version if major.minor is given', () => {
      expect(VersionUtils.resolveVersion('1.2', ['1.2.3', '1.2.7', '1.3.0', '2.0.0'])).toBe('1.2.7');
    });

    it('should return the max satisfying version if major.minor.x is given', () => {
      expect(VersionUtils.resolveVersion('1.2.x', ['1.2.3', '1.2.7', '1.3.0', '2.0.0'])).toBe('1.2.7');
    });

    it('should return the max satisfying version if only major is given', () => {
      expect(VersionUtils.resolveVersion('1', ['1.2.3', '1.2.7', '1.3.0', '2.0.0'])).toBe('1.3.0');
    });

    it('should return the max satisfying version if major.x is given', () => {
      expect(VersionUtils.resolveVersion('1.x', ['1.2.3', '1.2.7', '1.3.0', '2.0.0'])).toBe('1.3.0');
    });

    it('should return the max satisfying version if major.x.x is given', () => {
      expect(VersionUtils.resolveVersion('1.x.x', ['1.2.3', '1.2.7', '1.3.0', '2.0.0'])).toBe('1.3.0');
    });

    it('should return the latest version if version is undefined', () => {
      expect(VersionUtils.resolveVersion(undefined, ['1.2.3', '1.2.7', '1.3.0', '2.0.0'])).toBe('2.0.0');
    });

    it('should return the latest version if version is empty string', () => {
      expect(VersionUtils.resolveVersion('', ['1.2.3', '1.2.7', '1.3.0', '2.0.0'])).toBe('2.0.0');
    });
  });

  describe('hasVersionUpgrade', () => {
    it('should return true if a higher version is available for pinned version', () => {
      expect(VersionUtils.hasVersionUpgrade('1.2.3', ['1.2.2', '1.2.3', '1.2.4'])).toBe(true);
    });

    it('should return true if a higher major or minor version is available for major.minor pinned version', () => {
      expect(VersionUtils.hasVersionUpgrade('1.2', ['1.2.2', '1.2.3', '1.2.4', '1.3.0'])).toBe(true);
    });

    it('should return true if a higher major version is available for major pinned version', () => {
      expect(VersionUtils.hasVersionUpgrade('1', ['1.2.2', '1.2.3', '1.2.4', '2.0.0'])).toBe(true);
    });

    it('should return false if no higher version is available for pinned version', () => {
      expect(VersionUtils.hasVersionUpgrade('1.2.3', ['1.2.2', '1.2.3'])).toBe(false);
    });

    it('should return false if no higher major or minor version is available for major.minor pinned version', () => {
      expect(VersionUtils.hasVersionUpgrade('1.2', ['1.2.2', '1.2.3', '1.2.4'])).toBe(false);
    });

    it('should return false if no higher major version is available for major pinned version', () => {
      expect(VersionUtils.hasVersionUpgrade('1', ['1.2.2', '1.2.3', '1.2.4'])).toBe(false);
    });

    it('should return false if only lower versions are available', () => {
      expect(VersionUtils.hasVersionUpgrade('1.2.3', ['1.2.0', '1.2.1'])).toBe(false);
    });

    it('should return false if no available versions are available', () => {
      expect(VersionUtils.hasVersionUpgrade('1.2.3', [])).toBe(false);
    });

    it('should return false if availableVersions is undefined', () => {
      expect(VersionUtils.hasVersionUpgrade('1.2.3', undefined)).toBe(false);
    });

    it('should return false if resolvedVersion is ""', () => {
      expect(VersionUtils.hasVersionUpgrade('', ['1.2.2', '1.2.3', '1.2.4'])).toBe(false);
    });

    it('should return false for non-semver version', () => {
      expect(VersionUtils.hasVersionUpgrade('master', ['1.2.2', '1.2.3', '1.2.4'])).toBe(false);
    });
  });

  describe('getVersionRemark', () => {
    it('should return "Version in bitrise.yml" for exact versions', () => {
      expect(VersionUtils.getVersionRemark('1.2.3')).toBe('Version in bitrise.yml');
    });

    it('should return "Version in bitrise.yml" for none semver versions', () => {
      expect(VersionUtils.getVersionRemark('master')).toBe('Version in bitrise.yml');
    });

    it('should return "Minor and patch updates" for major only', () => {
      expect(VersionUtils.getVersionRemark('1')).toBe('Minor and patch updates');
    });

    it('should return "Minor and patch updates" for major.x.x', () => {
      expect(VersionUtils.getVersionRemark('1.x.x')).toBe('Minor and patch updates');
    });

    it('should return "Patch updates only" for major.minor', () => {
      expect(VersionUtils.getVersionRemark('1.2')).toBe('Patch updates only');
    });

    it('should return "Patch updates only" for major.minor.x', () => {
      expect(VersionUtils.getVersionRemark('1.2.x')).toBe('Patch updates only');
    });

    it('should return "Always latest" for an empty string', () => {
      expect(VersionUtils.getVersionRemark('')).toBe('Always latest');
    });
  });
});
