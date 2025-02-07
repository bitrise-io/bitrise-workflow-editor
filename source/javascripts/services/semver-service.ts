import _ from 'underscore';

import { Step, StepCatalouge } from '../models';

type Version = {
  major?: string;
  minor?: string;
  patch?: string;
};

class SemverService {
  private WILDCARD = 'x';

  private WILDCARD_REGEX = / /;

  private MAXSEMVER = '';

  private fullVersionRegex = /^\d+\.\d+\.\d+$/g;

  constructor() {
    this.MAXSEMVER = this.semver({});
    this.WILDCARD_REGEX = new RegExp(`.${this.WILDCARD}`, 'g');
  }

  private semver = ({ major, minor, patch }: Version): string => {
    const maxVersion = Number.MAX_SAFE_INTEGER;
    return `${major || maxVersion}.${minor || maxVersion}.${patch || maxVersion}`;
  };

  private isVersionCompatible = (wildcard: string, version: string): boolean => {
    if (!version) {
      return false;
    }

    const semverParts = version.split('.');
    const wildcardParts = wildcard.split('.');

    return semverParts.every((aSemverPart, index) => {
      return aSemverPart === wildcardParts[index] || wildcardParts[index] === this.WILDCARD;
    });
  };

  isMajorVersionChange = (from: string, to: string): boolean => {
    if (!from || !to) {
      return false;
    }

    const fromMajor = from.split('.')[0];
    const toMajor = to.split('.')[0];
    return fromMajor !== toMajor;
  };

  reverseSort = (verStr1: string, verStr2: string): number => {
    const ver1 = (verStr1 || this.MAXSEMVER).split('.');
    const ver2 = (verStr2 || this.MAXSEMVER).split('.');

    let notEqInd = 0;
    while (ver1[notEqInd] === ver2[notEqInd] && notEqInd < Math.max(ver1.length - 1, ver2.length - 1)) {
      notEqInd += 1;
    }

    // make WILDCARD always the lowest priority than everything else
    ver1[notEqInd] = ver1[notEqInd] === this.WILDCARD ? '-1' : ver1[notEqInd] || '0';
    ver2[notEqInd] = ver2[notEqInd] === this.WILDCARD ? '-1' : ver2[notEqInd] || '0';

    // comply with compare interface
    const diff = Math.sign(parseInt(ver1[notEqInd], 10) - parseInt(ver2[notEqInd], 10));
    return -diff;
  };

  sort = (verStr1: string, verStr2: string): number => {
    return this.reverseSort(verStr2, verStr1);
  };

  shortenWildcardVersion = (version: string | null): string | undefined => version?.replace(this.WILDCARD_REGEX, '');

  normalizeVersion = (version: string | null): string | null => {
    if (!version || this.fullVersionRegex.test(version)) {
      return version;
    }

    const semverParts = version.split('.');

    return this.semver({
      major: semverParts[0] || this.WILDCARD,
      minor: semverParts[1] || this.WILDCARD,
      patch: semverParts[2] || this.WILDCARD,
    });
  };

  extractWildcardVersions = (step: Step, stepCatalogue: StepCatalouge): Array<string> => {
    const wildCards = Object.keys(stepCatalogue.steps[step.id]).map((version: string) => {
      const semVerParts = version.split('.');
      const major = semVerParts[0];
      const minor = semVerParts[1];

      return [
        this.semver({ major, minor, patch: this.WILDCARD }),
        this.semver({ major, minor: this.WILDCARD, patch: this.WILDCARD }),
      ];
    });

    return _.chain(wildCards)
      .flatten()
      .tap((wVersions: Array<string | null>) => {
        // adding step own version
        wVersions.push(step.version);
      })
      .uniq()
      .value()
      .sort(this.reverseSort);
  };

  resolveVersion = (version: string | null, stepId: string, stepCatalogue: StepCatalouge): string | undefined => {
    version = this.normalizeVersion(version);
    const step = stepCatalogue.steps[stepId];

    if (!version) {
      return stepCatalogue.latestStepVersions[stepId];
    }

    if (!step) {
      return undefined;
    }

    const stepVersions = Object.keys(step).sort(this.reverseSort);
    return stepVersions.find((stepVersion) => this.isVersionCompatible(version, stepVersion));
  };

  findLatestMajorVersion = (step: Step, stepCatalogue: StepCatalouge): string => {
    const MAJORLOCK = 2;
    const wVersions = this.extractWildcardVersions(step, stepCatalogue);

    return wVersions.find((version: string | null) => this.checkVersionPartsLocked(version, MAJORLOCK)) ?? '';
  };

  checkVersionPartsLocked = (version: string | null, lockedParts?: number): boolean | undefined => {
    const expectedPostfix = `.${this.WILDCARD}`.repeat(lockedParts || 1);
    return version?.endsWith(expectedPostfix);
  };
}

export default new SemverService();
