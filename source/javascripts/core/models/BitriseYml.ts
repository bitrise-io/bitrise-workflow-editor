export type BitriseYml = {
  format_version: string;
  default_step_lib_source?: string;
  project_type?: string;
  title?: string;
  summary?: string;
  description?: string;
  services?: Services;
  containers?: Containers;
  app?: AppModel;
  meta?: Meta;
  trigger_map?: TriggerMap;
  workflows?: Workflows;
  pipelines?: Pipelines;
  stages?: Stages;
  step_bundles?: StepBundles;
  includes?: IncludeItemModel[];
};

export type EnvironmentItemOptionsModel = {
  is_expand?: boolean;
  skip_if_empty?: boolean;
  title?: string;
  description?: string;
  summary?: string;
  category?: string;
  value_options?: string[];
  is_required?: boolean;
  is_dont_change_value?: boolean;
  is_template?: boolean;
  is_sensitive?: boolean;
  unset?: boolean;
  meta?: Record<string, unknown>;
};

export type EnvironmentItemModel = Record<string, unknown> & {
  opts?: EnvironmentItemOptionsModel;
};

export type EnvModel = EnvironmentItemModel[];

export type StepBundleModel = {
  envs?: EnvModel;
  inputs?: EnvModel;
  steps?: Steps;
  title?: string;
  summary?: string;
  description?: string;
};

export type IncludeItemModel = {
  path: string;
  repository?: string;
  branch?: string;
  commit?: string;
  tag?: string;
};

export type StageModel = {
  title?: string;
  summary?: string;
  description?: string;
  workflows?: StageWorkflows;
  abort_on_fail?: boolean;
  should_always_run?: boolean;
};

export type WorkflowStageConfigModel = {
  run_if?: string;
};

export type StepModel = {
  title?: string;
  summary?: string;
  description?: string;
  website?: string;
  source_code_url?: string;
  support_url?: string;
  published_at?: string;
  source?: StepSourceModel;
  host_os_tags?: string[];
  project_type_tags?: string[];
  type_tags?: string[];
  deps?: DepsModel;
  inputs?: EnvModel;
  outputs?: EnvModel;
  run_if?: string;
  is_always_run?: boolean;
  is_skippable?: boolean;
  is_requires_admin_user?: boolean;
  toolkit?: StepToolkitModel;
  timeout?: number;
  no_output_timeout?: number;
  asset_urls?: Record<string, string>;
};

export type StepToolkitModel = {
  bash?: BashStepToolkitModel;
  go?: GoStepToolkitModel;
};

export type BashStepToolkitModel = {
  entry_file?: string;
};

export type GoStepToolkitModel = {
  package_name: string;
};

export type WorkflowModel = {
  title?: string;
  summary?: string;
  description?: string;
  before_run?: string[];
  after_run?: string[];
  envs?: EnvModel;
  steps?: StepListItemModel[];
  meta?: Meta;
  timeout_in_minutes?: number;
  triggers?: TriggersModel;
  status_report_name?: string;
};

export type TriggerMapItemModel = {
  type?: 'push' | 'pull_request' | 'tag';
  pattern?: string;
  enabled?: boolean;
  pipeline?: string;
  workflow?: string;
  push_branch?: TriggerMapItemModelRegexCondition;
  commit_message?: TriggerMapItemModelRegexCondition;
  changed_files?: TriggerMapItemModelRegexCondition;
  pull_request_source_branch?: TriggerMapItemModelRegexCondition;
  pull_request_target_branch?: TriggerMapItemModelRegexCondition;
  draft_pull_request_enabled?: boolean;
  pull_request_label?: TriggerMapItemModelRegexCondition;
  pull_request_comment?: TriggerMapItemModelRegexCondition;
  tag?: TriggerMapItemModelRegexCondition;
  is_pull_request_allowed?: boolean;
};

export type WithModel = {
  container?: string;
  services?: string[];
  steps: Steps;
};

export type Meta = {
  'bitrise.io'?: {
    stack?: string;
    machine_type_id?: string;
    license_pool_id?: string;
  };
  sensitivity?: string;
};

export type AppModel = {
  title?: string;
  summary?: string;
  description?: string;
  status_report_name?: string;
  envs?: EnvModel;
};

export type StepSourceModel = {
  git: string;
  commit?: string;
};

export type DepsModel = {
  brew?: (string | BrewDepModel)[];
  apt_get?: (string | AptGetDepModel)[];
  check_only?: (string | CheckOnlyDepModel)[];
};

export type BrewDepModel = {
  name: string;
  bin_name?: string;
};

export type AptGetDepModel = {
  name: string;
  bin_name?: string;
};

export type CheckOnlyDepModel = {
  name: string;
};

export type PipelineModel = {
  title?: string;
  summary?: string;
  description?: string;
  triggers?: TriggersModel;
  status_report_name?: string;
  stages?: PipelineStages;
  workflows?: PipelineWorkflows;
};

export type TriggersModel = {
  enabled?: boolean;
  push?: PushTriggerModel[];
  pull_request?: PullrequestTriggerModel[];
  tag?: TagTriggerModel[];
};

export type GraphPipelineWorkflowModel = {
  uses?: string;
  parallel?: string | number;
  depends_on?: string[];
  abort_on_fail?: boolean;
  should_always_run?: 'off' | 'workflow';
  run_if?: {
    expression: string;
  };
};

export type PushTriggerModel = {
  enabled?: boolean;
  branch?: TriggerMapItemModelRegexCondition;
  commit_message?: TriggerMapItemModelRegexCondition;
  changed_files?: TriggerMapItemModelRegexCondition;
};

export type PullrequestTriggerModel = {
  enabled?: boolean;
  draft_enabled?: boolean;
  source_branch?: TriggerMapItemModelRegexCondition;
  target_branch?: TriggerMapItemModelRegexCondition;
  label?: TriggerMapItemModelRegexCondition;
  comment?: TriggerMapItemModelRegexCondition;
  commit_message?: TriggerMapItemModelRegexCondition;
  changed_files?: TriggerMapItemModelRegexCondition;
};

export type TagTriggerModel = {
  enabled?: boolean;
  name?: TriggerMapItemModelRegexCondition;
};

export type TriggerMapItemModelRegexCondition =
  | string
  | {
      regex: string;
    };

export type StepListItemModel = {
  [stepId: string]: StepModel | WithModel | StepBundleModel;
};

export type ContainerModel = {
  image: string;
  credentials?: DockerCredentialModel;
  ports?: string[];
  envs?: EnvModel;
  options?: string;
};

export type DockerCredentialModel = {
  username: string;
  password: string;
  server?: string;
};

// Helper types
export type TriggerMap = TriggerMapItemModel[];
export type Steps = Record<string, StepModel>[];
export type Stages = Record<string, StageModel>;
export type Services = Record<string, ContainerModel>;
export type Workflows = Record<string, WorkflowModel>;
export type Pipelines = Record<string, PipelineModel>;
export type Containers = Record<string, ContainerModel>;
export type StepBundles = Record<string, StepBundleModel>;
export type PipelineStages = Record<string, StageModel>[];
export type StageWorkflows = Record<string, WorkflowStageConfigModel>[];
export type PipelineWorkflows = Record<string, GraphPipelineWorkflowModel>;
