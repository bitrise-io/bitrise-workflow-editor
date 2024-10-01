export type BitriseYml = {
  app?: AppModel;
  containers?: { [key: string]: ContainerModel };
  default_step_lib_source?: string;
  description?: string;
  format_version?: string;
  includes?: IncludeItemModel[];
  meta?: { [key: string]: any[] | boolean | number | number | { [key: string]: any } | null | string };
  pipelines?: { [key: string]: PipelineModel };
  project_type?: string;
  services?: { [key: string]: ContainerModel };
  stages?: { [key: string]: StageModel };
  step_bundles?: { [key: string]: StepBundleModel };
  summary?: string;
  title?: string;
  trigger_map?: TriggerMapItemModel[];
  workflows?: { [key: string]: WorkflowModel };
};

export type AppModel = {
  description?: string;
  envs?: { [key: string]: any[] | boolean | number | number | { [key: string]: any } | null | string }[];
  summary?: string;
  title?: string;
};

export type ContainerModel = {
  credentials?: DockerCredentialModel;
  envs?: { [key: string]: any[] | boolean | number | number | { [key: string]: any } | null | string }[];
  image: string;
  options?: string;
  ports?: string[];
};

export type DockerCredentialModel = {
  password: string;
  server?: string;
  username: string;
};

export type IncludeItemModel = {
  branch?: string;
  commit?: string;
  path: string;
  repository?: string;
  tag?: string;
};

export type PipelineModel = {
  description?: string;
  stages?: { [key: string]: StageModel }[];
  summary?: string;
  title?: string;
  triggers?: TriggersModel;
};

export type StageModel = {
  abort_on_fail?: boolean;
  description?: string;
  should_always_run?: boolean;
  summary?: string;
  title?: string;
  workflows?: { [key: string]: WorkflowStageConfigModel }[];
};

export type WorkflowStageConfigModel = {
  run_if?: string;
};

export type TriggersModel = {
  enabled?: boolean;
  pull_request?: PullrequestTriggerModel[];
  push?: PushTriggerModel[];
  tag?: TagTriggerModel[];
};

export type PullrequestTriggerModel = {
  changed_files?: TriggerMapItemModelRegexCondition | string;
  comment?: TriggerMapItemModelRegexCondition | string;
  commit_message?: TriggerMapItemModelRegexCondition | string;
  draft_enabled?: boolean;
  enabled?: boolean;
  label?: TriggerMapItemModelRegexCondition | string;
  source_branch?: TriggerMapItemModelRegexCondition | string;
  target_branch?: TriggerMapItemModelRegexCondition | string;
};

export type TriggerMapItemModelRegexCondition = {
  regex?: string;
};

export type PushTriggerModel = {
  branch?: TriggerMapItemModelRegexCondition | string;
  changed_files?: TriggerMapItemModelRegexCondition | string;
  commit_message?: TriggerMapItemModelRegexCondition | string;
  enabled?: boolean;
};

export type TagTriggerModel = {
  enabled?: boolean;
  name?: TriggerMapItemModelRegexCondition | string;
};

export type StepBundleModel = {
  envs?: { [key: string]: any[] | boolean | number | number | { [key: string]: any } | null | string }[];
  steps?: { [key: string]: StepModel }[];
};

export type StepModel = {
  asset_urls?: { [key: string]: string };
  deps?: DepsModel;
  description?: string;
  host_os_tags?: string[];
  inputs?: { [key: string]: any[] | boolean | number | number | { [key: string]: any } | null | string }[];
  is_always_run?: boolean;
  is_requires_admin_user?: boolean;
  is_skippable?: boolean;
  meta?: { [key: string]: any[] | boolean | number | number | { [key: string]: any } | null | string };
  no_output_timeout?: number;
  outputs?: { [key: string]: any[] | boolean | number | number | { [key: string]: any } | null | string }[];
  project_type_tags?: string[];
  published_at?: Date;
  run_if?: string;
  source?: StepSourceModel;
  source_code_url?: string;
  summary?: string;
  support_url?: string;
  timeout?: number;
  title?: string;
  toolkit?: StepToolkitModel;
  type_tags?: string[];
  website?: string;
};

export type DepsModel = {
  apt_get?: AptGetDepModel[];
  brew?: BrewDepModel[];
  check_only?: CheckOnlyDepModel[];
};

export type AptGetDepModel = {
  bin_name?: string;
  name?: string;
};

export type BrewDepModel = {
  bin_name?: string;
  name?: string;
};

export type CheckOnlyDepModel = {
  name?: string;
};

export type StepSourceModel = {
  commit?: string;
  git?: string;
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

export type TriggerMapItemModel = {
  changed_files?: TriggerMapItemModelRegexCondition | string;
  commit_message?: TriggerMapItemModelRegexCondition | string;
  draft_pull_request_enabled?: boolean;
  enabled?: boolean;
  is_pull_request_allowed?: boolean;
  pattern?: string;
  pipeline?: string;
  pull_request_comment?: TriggerMapItemModelRegexCondition | string;
  pull_request_label?: TriggerMapItemModelRegexCondition | string;
  pull_request_source_branch?: TriggerMapItemModelRegexCondition | string;
  pull_request_target_branch?: TriggerMapItemModelRegexCondition | string;
  push_branch?: TriggerMapItemModelRegexCondition | string;
  tag?: TriggerMapItemModelRegexCondition | string;
  type?: Type;
  workflow?: string;
};

export enum Type {
  PullRequest = 'pull_request',
  Push = 'push',
  Tag = 'tag',
}

export type WorkflowModel = {
  after_run?: string[];
  before_run?: string[];
  description?: string;
  envs?: { [key: string]: any[] | boolean | number | number | { [key: string]: any } | null | string }[];
  meta?: { [key: string]: any[] | boolean | number | number | { [key: string]: any } | null | string };
  steps?: { [key: string]: StepModel }[];
  summary?: string;
  title?: string;
  triggers?: TriggersModel;
};
