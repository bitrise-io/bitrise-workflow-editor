import { WorkflowYmlObject } from './Workflow';

enum Maintainer {
  Bitrise = 'bitrise',
  Verified = 'verified',
  Community = 'community',
}

type Steps = Required<WorkflowYmlObject>['steps'];
type StepYmlObject = Omit<
  Extract<
    Steps[number][string],
    {
      title?: string;
      summary?: string;
      description?: string;
      website?: string;
      type_tags?: string[];
    }
  >,
  'inputs' | 'outputs'
> & {
  inputs?: StepInputVariable[];
  outputs?: StepOutputVariable[];
};
type StepBundleYmlObject = Extract<Steps[number][string], { steps: StepYmlObject[] }>;
type WithGroupYmlObject = Extract<
  Steps[number][string],
  {
    container?: string;
    services?: string[];
    steps: StepYmlObject[];
  }
> & { image?: string };
type StepLike = StepYmlObject | StepBundleYmlObject | WithGroupYmlObject;
type Step = {
  cvs: string;
  defaultValues?: StepYmlObject; // The defaults are coming from the step.yml file loaded from the API
  userValues?: StepYmlObject; // The values are coming from the bitrise.yml file defined by the user
  mergedValues?: StepYmlObject; // the merged values of the defaults and user values
  resolvedInfo?: ResolvedStepInfo;
};

type ResolvedStepInfo = Partial<{
  id: string;
  title: string;
  icon: string;
  version: string; // 2 || 2.1 || 2.1.6
  normalizedVersion: string; // 2.x.x
  resolvedVersion: string; // 2.1.6
  latestVersion: string; // 2.1.9
  versions: string[]; // ['2.1.6', '2.1.7', '2.1.8', '2.1.9']
  isLatest: boolean;
  isUpgradable: boolean;
  isOfficial: boolean;
  isVerified: boolean;
  isCommunity: boolean;
  isDeprecated: boolean;
}>;

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

type StepVariable = {
  [key: string]: unknown;
  opts?: VariableOpts;
};

type StepInputVariable = StepVariable;
type StepOutputVariable = StepVariable;

export {
  Steps,
  StepLike,
  StepYmlObject,
  StepBundleYmlObject,
  WithGroupYmlObject,
  Step,
  ResolvedStepInfo,
  StepVariable,
  StepInputVariable,
  StepOutputVariable,
  VariableOpts,
  Maintainer,
};
