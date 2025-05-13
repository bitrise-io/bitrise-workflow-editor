import { TriggerMapItemModel } from '@/core/models/BitriseYml';
import { Condition, TargetBasedConditionType, Trigger, TriggerType } from '@/core/models/Trigger';

export type LegacyPushConditionType = keyof Pick<
  TriggerMapItemModel,
  'push_branch' | 'commit_message' | 'changed_files'
>;
export type LegacyPrConditionType = keyof Pick<
  TriggerMapItemModel,
  | 'pull_request_target_branch'
  | 'pull_request_source_branch'
  | 'pull_request_label'
  | 'pull_request_comment'
  | 'commit_message'
  | 'changed_files'
>;
export type LegacyTagConditionType = keyof Pick<TriggerMapItemModel, 'tag'>;
export type LegacyConditionType = LegacyPushConditionType | LegacyPrConditionType | LegacyTagConditionType;
export type LegacyTriggerItemModel = TriggerMapItemModel;
export type LegacyCondition = Condition<LegacyConditionType>;
export type LegacyTrigger = Trigger<LegacyConditionType>;

type LegacyTriggerMapping = {
  [key in TriggerType]: key extends 'push'
    ? Record<LegacyPushConditionType, string>
    : key extends 'pull_request'
      ? Record<LegacyPrConditionType, string>
      : key extends 'tag'
        ? Record<LegacyTagConditionType, string>
        : never;
};

export const ALL_LEGACY_CONDITION_TYPES = [
  'push_branch',
  'commit_message',
  'changed_files',
  'pull_request_target_branch',
  'pull_request_source_branch',
  'pull_request_label',
  'pull_request_comment',
  'tag',
] as const satisfies readonly LegacyConditionType[];

export const LEGACY_LABELS_MAP = {
  push: {
    push_branch: 'Push branch',
    commit_message: 'Enter a commit message',
    changed_files: 'Enter a path',
  },
  pull_request: {
    pull_request_target_branch: 'Enter a target branch',
    pull_request_source_branch: 'Enter a source branch',
    pull_request_label: 'Enter a label',
    pull_request_comment: 'Enter a comment',
    commit_message: 'Enter a commit message',
    changed_files: 'Enter a path',
  },
  tag: {
    tag: 'Enter a tag',
  },
} as const satisfies LegacyTriggerMapping;

export const LEGACY_OPTIONS_MAP = {
  push: {
    push_branch: 'Push branch',
    commit_message: 'Commit message',
    changed_files: 'File change',
  },
  pull_request: {
    pull_request_target_branch: 'Target branch',
    pull_request_source_branch: 'Source branch',
    pull_request_label: 'PR label',
    pull_request_comment: 'PR comment',
    commit_message: 'Commit message',
    changed_files: 'File change',
  },
  tag: {
    tag: 'Tag',
  },
} as const satisfies LegacyTriggerMapping;

export const LEGACY_TO_TARGET_BASED_CONDITION_MAP: Record<LegacyConditionType, TargetBasedConditionType> = {
  push_branch: 'branch',
  commit_message: 'commit_message',
  changed_files: 'changed_files',
  pull_request_source_branch: 'source_branch',
  pull_request_target_branch: 'target_branch',
  pull_request_label: 'label',
  pull_request_comment: 'comment',
  tag: 'name',
};
