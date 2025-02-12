type BitriseDataModel = {
  format_version: string;
  default_step_lib_source?: string;
  project_type?: string;
  title?: string;
  summary?: string;
  description?: string;
  services?: Record<string, ContainerModel>;
  containers?: Record<string, ContainerModel>;
  app?: AppModel;
  meta?: Meta;
  trigger_map?: TriggerMapItemModel[];
  workflows?: Record<string, WorkflowModel>;
  pipelines?: Record<string, PipelineModel>;
  stages?: Record<string, StageModel>;
  step_bundles?: Record<string, StepBundleModel>;
  includes?: IncludeItemModel[];
};

type EnvironmentItemOptionsModel = {
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

type EnvironmentItemModel = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  opts?: EnvironmentItemOptionsModel;
};

type EnvModel = EnvironmentItemModel[];

type StepBundleModel = {
  envs?: EnvModel;
  steps?: Array<Record<string, StepModel>>;
};

type StepBundleOverrideModel = {
  envs?: EnvModel;
};

type IncludeItemModel = {
  path: string;
  repository?: string;
  branch?: string;
  commit?: string;
  tag?: string;
};

type StageModel = {
  title?: string;
  summary?: string;
  description?: string;
  workflows?: Array<Record<string, WorkflowStageConfigModel>>;
  abort_on_fail?: boolean;
  should_always_run?: boolean;
};

type WorkflowStageConfigModel = {
  run_if?: string;
};

type StepModel = {
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

type StepToolkitModel = {
  bash?: BashStepToolkitModel;
  go?: GoStepToolkitModel;
};

type BashStepToolkitModel = {
  entry_file?: string;
};

type GoStepToolkitModel = {
  package_name: string;
};

type WorkflowModel = {
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

type TriggerMapItemModel = {
  type?: 'push' | 'pull_request' | 'tag';
  pattern?: string;
  enabled?: boolean;
  pipeline?: string;
  workflow?: string;
  push_branch?: string | TriggerMapItemModelRegexCondition;
  commit_message?: string | TriggerMapItemModelRegexCondition;
  changed_files?: string | TriggerMapItemModelRegexCondition;
  pull_request_source_branch?: string | TriggerMapItemModelRegexCondition;
  pull_request_target_branch?: string | TriggerMapItemModelRegexCondition;
  draft_pull_request_enabled?: boolean;
  pull_request_label?: string | TriggerMapItemModelRegexCondition;
  pull_request_comment?: string | TriggerMapItemModelRegexCondition;
  tag?: string | TriggerMapItemModelRegexCondition;
  is_pull_request_allowed?: boolean;
};

type WithModel = {
  container?: string;
  services?: string[];
  steps: Array<Record<string, StepModel>>;
};

type Meta = {
  'bitrise.io'?: {
    stack?: string;
    machine_type_id?: string;
    license_pool_id?: string;
  };
  sensitivity?: string;
};

type AppModel = {
  title?: string;
  summary?: string;
  description?: string;
  status_report_name?: string;
  envs?: EnvModel;
};

type StepSourceModel = {
  git: string;
  commit?: string;
};

type DepsModel = {
  brew?: Array<string | BrewDepModel>;
  apt_get?: Array<string | AptGetDepModel>;
  check_only?: Array<string | CheckOnlyDepModel>;
};

type BrewDepModel = {
  name: string;
  bin_name?: string;
};

type AptGetDepModel = {
  name: string;
  bin_name?: string;
};

type CheckOnlyDepModel = {
  name: string;
};

type PipelineModel = {
  title?: string;
  summary?: string;
  description?: string;
  triggers?: TriggersModel;
  status_report_name?: string;
  stages?: Array<Record<string, StageModel>>;
  workflows?: Record<string, GraphPipelineWorkflowModel>;
};

type TriggersModel = {
  enabled?: boolean;
  push?: PushTriggerModel[];
  pull_request?: PullrequestTriggerModel[];
  tag?: TagTriggerModel[];
};

type GraphPipelineWorkflowModel = {
  uses?: string;
  parallel?: number;
  depends_on?: string[];
  abort_on_fail?: boolean;
  should_always_run?: 'off' | 'workflow';
  run_if?: {
    expression: string;
  };
};

type PushTriggerModel = {
  enabled?: boolean;
  branch?: string | TriggerMapItemModelRegexCondition;
  commit_message?: string | TriggerMapItemModelRegexCondition;
  changed_files?: string | TriggerMapItemModelRegexCondition;
};

type PullrequestTriggerModel = {
  enabled?: boolean;
  draft_enabled?: boolean;
  source_branch?: string | TriggerMapItemModelRegexCondition;
  target_branch?: string | TriggerMapItemModelRegexCondition;
  label?: string | TriggerMapItemModelRegexCondition;
  comment?: string | TriggerMapItemModelRegexCondition;
  commit_message?: string | TriggerMapItemModelRegexCondition;
  changed_files?: string | TriggerMapItemModelRegexCondition;
};

type TagTriggerModel = {
  enabled?: boolean;
  name?: string | TriggerMapItemModelRegexCondition;
};

type TriggerMapItemModelRegexCondition = {
  regex: string;
};

type StepListItemModel = {
  [stepId: string]: StepModel | WithModel | StepBundleOverrideModel;
};

type ContainerModel = {
  image: string;
  credentials?: DockerCredentialModel;
  ports?: string[];
  envs?: EnvModel;
  options?: string;
};

type DockerCredentialModel = {
  username: string;
  password: string;
  server?: string;
};

type BitriseYml = BitriseDataModel;

export { BitriseYml, Meta };
