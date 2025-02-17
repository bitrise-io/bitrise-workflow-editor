import { StepBundleModel, StepModel, WithModel } from './BitriseYml';

export const BITRISE_STEP_LIBRARY_URL = 'https://github.com/bitrise-io/bitrise-steplib.git';
export const BITRISE_STEP_LIBRARY_SSH_URL = 'git@github.com:bitrise-io/bitrise-steplib.git';

export enum Maintainer {
  Bitrise = 'bitrise',
  Verified = 'verified',
  Community = 'community',
}

export enum LibraryType {
  BITRISE = 'bitrise',
  CUSTOM = 'custom',
  GIT = 'git',
  LOCAL = 'path',
  BUNDLE = 'bundle',
  WITH = 'with',
}

export type StepLikeYmlObject = StepModel | StepBundleModel | WithModel;

export type Step = {
  cvs: string;
  id: string;
  title: string;
  icon: string;
  defaultValues?: StepModel; // The defaults are coming from the step.yml file loaded from the API
  userValues: StepModel; // The values are coming from the bitrise.yml file defined by the user
  mergedValues: StepModel; // the merged values of the defaults and user values
  resolvedInfo: ResolvedStepInfo;
};

export type WithGroup = {
  cvs: string;
  id: string;
  title: string;
  icon: string;
  userValues: WithModel;
};

export type StepBundle = {
  cvs: string;
  id: string;
  title?: string;
  icon?: string;
  userValues: StepBundleModel;
};

export type StepLike = Step | WithGroup | StepBundle;

export type ResolvedStepInfo = Partial<{
  version: string; // 2 || 2.1 || 2.1.6
  normalizedVersion: string; // 2.x.x
  resolvedVersion: string; // 2.1.6
  latestVersion: string; // 2.1.9
  versions: string[]; // ['2.1.6', '2.1.7', '2.1.8', '2.1.9']
  isLatest: boolean;
  isOfficial: boolean;
  isVerified: boolean;
  isCommunity: boolean;
  isDeprecated: boolean;
}>;
