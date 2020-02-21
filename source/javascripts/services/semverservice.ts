import _ from "underscore";
import { Step, StepCatalouge } from "../models";

type Version = {
    major? :string;
    minor? :string;
    patch? :string;
};

class SemverService {
    private WILDCARD :string = 'x';
    private WILDCARD_REGEX :RegExp = / /;
    private MAXSEMVER :string = '';
    private fullVersionRegex :RegExp = /^\d+\.\d+\.\d+$/g;

    constructor() {
        this.MAXSEMVER = this.semver({});
        this.WILDCARD_REGEX = new RegExp("\." + this.WILDCARD, "g");
    }

    private semver = ({ major, minor, patch }: Version): string => {
        const maxVersion = Number.MAX_SAFE_INTEGER;
        return `${major || maxVersion}.${minor || maxVersion}.${patch || maxVersion}`;
    };

    private isVersionCompatible = (wildcard: string, version: string): boolean => {
        if (!version) {
            return false;
        }

        const semverParts = version.split(".");
        const wildcardParts = wildcard.split(".");

        return semverParts.every((aSemverPart, index) => {
            return aSemverPart == wildcardParts[index] || wildcardParts[index] == this.WILDCARD;
        });
    };

    private reverseSorter = (verStr1: string, verStr2: string): number => {
        const ver1 = (verStr1 || this.MAXSEMVER).split(".");
        const ver2 = (verStr2 || this.MAXSEMVER).split(".");

        let notEqInd = 0;
        while (ver1[notEqInd] == ver2[notEqInd] && notEqInd < Math.max(ver1.length, ver2.length)) {
            notEqInd++;
        }

        // make WILDCARD always the lowest priority than everything else
        ver1[notEqInd] = ver1[notEqInd] === this.WILDCARD ? '-1' : ver1[notEqInd];
        ver2[notEqInd] = ver2[notEqInd] === this.WILDCARD ? '-1' : ver2[notEqInd];

        // comply with compare interface
        return Math.sign(parseInt(ver1[notEqInd]) - parseInt(ver2[notEqInd])) * -1;
    };

    shortenWildcardVersion = (version: string|null): string|undefined => version?.replace(this.WILDCARD_REGEX, "");

    normalizeVersion = (version :string|null): string|null => {
        if (!version || this.fullVersionRegex.test(version)) {
            return version;
        }

        const semverParts = version.split(".");

        return this.semver({
            major: semverParts[0] || this.WILDCARD,
            minor: semverParts[1] || this.WILDCARD,
            patch: semverParts[2] || this.WILDCARD,
        });
    }

    extractWildcardVersions = (step: Step, stepCatalogue: StepCatalouge): Array<string> => {
        const wildCards = Object.keys(stepCatalogue.steps[step.id]).map(version => {
            const semVerParts = version.split(".");
            const major = semVerParts[0];
            const minor = semVerParts[1];

            return [
                this.semver({ major: major, minor: minor, patch: this.WILDCARD }),
                this.semver({ major: major, minor: this.WILDCARD, patch: this.WILDCARD })
            ];
        });

        return _.chain(wildCards)
            .flatten()
            .tap(function(wVersions) {
                // adding step own version
                wVersions.push(step.version);
            })
            .uniq()
            .value()
            .sort(this.reverseSorter);
    };

    resolveVersion = (version: string|null, stepId: string, stepCatalogue: StepCatalouge): string|undefined => {
        version = this.normalizeVersion(version);

        if (!version) {
            return stepCatalogue.latestStepVersions[stepId];
        }

        const stepVersions = Object.keys(stepCatalogue.steps[stepId]).sort(this.reverseSorter);

        return stepVersions
            .find(stepVersion => this.isVersionCompatible(<string>version, stepVersion));
    };

    checkVersionPartsLocked = (version: string|null, lockedParts: number|undefined): boolean|undefined => {
        const expectedPostfix = `.${this.WILDCARD}`.repeat(lockedParts || 1);
        return version?.endsWith(expectedPostfix);
    };
}

export default SemverService;
