import semver, { gtr } from 'semver';

const MINOR_AND_PATCH_UPDATES = /\d+\.\d+\.x/;
const PATCH_UPDATES_ONLY = /\d+\.x\.x/;

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

function resolveVersion(version?: string, latestVersion?: string, availableVersions: string[] = []) {
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
  resolveVersion,
  hasVersionUpgrade,
  getVersionRemark,
};
