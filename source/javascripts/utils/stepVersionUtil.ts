import semverService from "../services/semver-service";

export const getVersionRemark = (version: string) => {
	if (semverService.checkVersionPartsLocked(version, 2)) {
		return "Minor and patch updates";
	} else if (semverService.checkVersionPartsLocked(version, 1)) {
		return "Patch updates only";
	}

	return "Version in bitrise.yml";
};
