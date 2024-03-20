import { Step } from "../../models";

export const extractStepFields = (step?: Step) => {
  return {
    name: step?.displayName() || "",
    version: step?.requestedVersion() || "",
    sourceURL: step?.sourceURL() || "",
    summary: step?.summary() || "",
    description: step?.description() || "",
    isLibraryStep: step?.isLibraryStep(),
  };
};

export const extractInputNames = (step?: Step) => {
  if (!step) {
    return [];
  }

  return step.defaultStepConfig.inputs
    .map((inputObj) => Object.keys(inputObj).find((k) => k !== "opts") || "")
    .filter((i) => !!i);
};

export const extractReleaseNotesUrl = (step?: Step) => {
  if (!step) {
    return "";
  }

  let releaseUrl = step.defaultStepConfig.source_code_url || "";
  if (releaseUrl.startsWith("https://github.com")) {
    releaseUrl += "/releases";
  }
  return releaseUrl;
};
