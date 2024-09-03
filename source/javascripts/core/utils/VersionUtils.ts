import semver, { gtr } from 'semver';

const MINOR_AND_PATCH_UPDATES = /\d+\.x\.x/;
const PATCH_UPDATES_ONLY = /\d+\.\d+\.x/;

function normalizeVersion(version?: string) {
  if (!version) {
    return version;
  }

  if (/^(\d+)(\.\d+)?$/g.test(version)) {
    const match = version.split('.');
    const major = match[0];
    const minor = match[1] || 'x';
    return `${major}.${minor}.x`;
  }

  return version;
}

function getNormalizedVersions(versions?: string[]): string[] {
  return Array.from(
    versions?.reduce((set, version) => {
      const [major, minor] = version.split('.');
      set.add(`${major}.x.x`);
      set.add(`${major}.${minor}.x`);
      return set;
    }, new Set<string>()) || [],
  );
}

function resolveVersion(
  version: string | undefined,
  opts: {
    latestVersion: string;
    availableVersions?: string[];
  },
) {
  const { latestVersion, availableVersions = [] } = opts;
  const normalizedVersion = normalizeVersion(version);

  if (!normalizedVersion) {
    return latestVersion;
  }

  return semver.maxSatisfying(availableVersions, normalizedVersion) || normalizedVersion;
}

function hasVersionUpgrade(resolvedVersion?: string, availableVersions?: string[]) {
  if (!availableVersions || !resolvedVersion) {
    return false;
  }

  return availableVersions.some((possibleVersion) => gtr(possibleVersion, resolvedVersion));
}

const getVersionRemark = (version: string) => {
  if (MINOR_AND_PATCH_UPDATES.test(version)) {
    return 'Minor and patch updates';
  }
  if (PATCH_UPDATES_ONLY.test(version)) {
    return 'Patch updates only';
  }

  return 'Version in bitrise.yml';
};

export default {
  normalizeVersion,
  getNormalizedVersions,
  resolveVersion,
  hasVersionUpgrade,
  getVersionRemark,
};
