import { Workflow } from '@/core/models/Workflow';

enum Maintainer {
  Bitrise = 'bitrise',
  Verified = 'verified',
  Community = 'community',
}

type Steps = Required<Workflow>['steps'];
type Step = Omit<Extract<Steps[number][string], { website?: string }>, 'inputs' | 'outputs'> & {
  inputs?: StepInputVariable[];
  outputs?: StepOutputVariable[];
  info?: {
    id: string;
    cvs: string;
    icon?: string;
    isOfficial: boolean;
    isVerified: boolean;
    isCommunity: boolean;
    isDeprecated: boolean;
  };
  versionInfo?: {
    availableVersions?: string[];
    version: string; // 2
    selectedVersion?: string; // 2.x.x
    resolvedVersion?: string; // 2.1.9
    latestVersion?: string; // 2.1.9
    isLatest: boolean;
  };
};
type StepBundle = Extract<Steps[number][string], { steps: string[] }>;
type DockerStep = Extract<Steps[number][string], { image: string }>;
type WithBlockData = {
  image?: string;
  services?: string[];
  container?: string;
  steps: string[];
};

type VariableOpts = Partial<{
  title: string;
  summary: string;
  category: string;
  description: string;
  value_options: string[];
  unset: boolean;
  is_expand: boolean;
  is_template: boolean;
  is_required: boolean;
  is_sensitive: boolean;
  skip_if_empty: boolean;
  is_dont_change_value: boolean;
}>;

type StepInputVariable = {
  [key: string]: unknown;
  opts?: VariableOpts;
};

type StepOutputVariable = {
  [key: string]: unknown;
  opts?: VariableOpts;
};

export {
  Maintainer,
  Steps,
  Step,
  StepBundle,
  DockerStep,
  WithBlockData,
  StepInputVariable,
  StepOutputVariable,
  VariableOpts,
};
