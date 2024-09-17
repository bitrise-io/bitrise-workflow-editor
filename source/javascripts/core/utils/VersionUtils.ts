import semver, { gtr } from 'semver';

const EXACT_VERSION = /\d+\.\d+\.\d+/;
const MINOR_AND_PATCH_UPDATES = /\d+\.x\.x/;
const PATCH_UPDATES_ONLY = /\d+\.\d+\.x/;

function normalizeVersion(version?: string) {
  if (!version) {
    return '';
  }

  if (EXACT_VERSION.test(version)) {
    return version;
  }

  if (/^\d+(\.\d+)?$/g.test(version)) {
    const match = version.split('.');
    const major = match[0];
    const minor = match[1] || 'x';
    return `${major}.${minor}.x`;
  }

  return version;
}

function denormalizeVersion(version?: string) {
  return version ? version.replace(/\.x/g, '') : '';
}

function getNormalizedVersions(versions?: string[]): string[] {
  if (!versions) {
    return [];
  }

  const normalizedVersionsSet = versions.reduce<Set<string>>((set, version) => {
    const [major, minor] = version.split('.');
    set.add(`${major}.x.x`);
    set.add(`${major}.${minor}.x`);
    return set;
  }, new Set<string>());

  return Array.from(normalizedVersionsSet).sort((a, b) => {
    const [aMajor, aMinor] = a.split('.').map((part) => (part === 'x' ? -1 : Number(part)));
    const [bMajor, bMinor] = b.split('.').map((part) => (part === 'x' ? -1 : Number(part)));

    if (aMajor !== bMajor) {
      return bMajor - aMajor;
    }

    return bMinor - aMinor;
  });
}

function resolveVersion(version: string | undefined, availableVersions: string[] = []) {
  if (availableVersions.length === 0) {
    return version || '';
  }

  const latestVersion = semver.sort([...availableVersions]).pop();

  if (!version) {
    return latestVersion ?? '';
  }

  if (EXACT_VERSION.test(version)) {
    return version;
  }

  const normalizedVersion = normalizeVersion(version) || latestVersion || '*';
  return semver.maxSatisfying(availableVersions, normalizedVersion) ?? '';
}

function hasVersionUpgrade(resolvedVersion?: string, availableVersions?: string[]) {
  if (!availableVersions || !resolvedVersion) {
    return false;
  }

  return availableVersions.some((possibleVersion) => gtr(possibleVersion, resolvedVersion));
}

const getVersionRemark = (version: string) => {
  if (EXACT_VERSION.test(version)) {
    return 'Version in bitrise.yml';
  }

  const normalizedVersion = normalizeVersion(version);

  if (MINOR_AND_PATCH_UPDATES.test(normalizedVersion)) {
    return 'Minor and patch updates';
  }
  if (PATCH_UPDATES_ONLY.test(normalizedVersion)) {
    return 'Patch updates only';
  }

  return normalizedVersion ? 'Version in bitrise.yml' : 'Always latest';
};

export default {
  normalizeVersion,
  denormalizeVersion,
  getNormalizedVersions,
  resolveVersion,
  hasVersionUpgrade,
  getVersionRemark,
};
