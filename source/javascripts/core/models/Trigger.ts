import { IterableElement } from 'type-fest';

import { PullrequestTriggerModel, PushTriggerModel, TagTriggerModel, TriggersModel } from './BitriseYml';

export type TriggerSource = 'workflows' | 'pipelines';
export type TriggerType = keyof Omit<TriggersModel, 'enabled'>;
export const TYPE_MAP: Record<TriggerType, string> = {
  push: 'Push',
  pull_request: 'Pull request',
  tag: 'Tag',
};

export type Condition<TConditionType extends string> = {
  type: TConditionType;
  value: string;
  isRegex?: boolean;
  isLastCommitOnly?: boolean;
};

export type Trigger<TConditionType extends string> = {
  uniqueId: string;
  index: number;
  source: `${TriggerSource}#${string}` | '';
  triggerType: TriggerType;
  isActive: boolean;
  conditions: Condition<TConditionType>[];
  isDraftPr?: boolean;
  priority?: number;
};

export type TargetBasedPushConditionType = keyof Omit<IterableElement<TriggersModel['push']>, 'enabled' | 'priority'>;
export type TargetBasedPrConditionType = keyof Omit<
  IterableElement<TriggersModel['pull_request']>,
  'enabled' | 'priority' | 'draft_enabled'
>;
export type TargetBasedTagConditionType = keyof Omit<IterableElement<TriggersModel['tag']>, 'enabled' | 'priority'>;
export type TargetBasedConditionType =
  | TargetBasedPushConditionType
  | TargetBasedPrConditionType
  | TargetBasedTagConditionType;
export type TargetBasedTriggerItemModel = PushTriggerModel & PullrequestTriggerModel & TagTriggerModel;
export type TargetBasedCondition = Condition<TargetBasedConditionType>;
export type TargetBasedTrigger = Trigger<TargetBasedConditionType>;

export type TargetBasedTriggerMapping = {
  [key in TriggerType]: key extends 'push'
    ? Record<TargetBasedPushConditionType, string>
    : key extends 'pull_request'
      ? Record<TargetBasedPrConditionType, string>
      : key extends 'tag'
        ? Record<TargetBasedTagConditionType, string>
        : never;
};

export const ALL_TARGET_BASED_CONDITION_TYPES = [
  'branch',
  'commit_message',
  'changed_files',
  'target_branch',
  'source_branch',
  'label',
  'comment',
  'name',
] as const satisfies readonly TargetBasedConditionType[];

export const TARGET_BASED_OPTIONS_MAP = {
  push: {
    branch: 'Push branch',
    commit_message: 'Commit message',
    changed_files: 'File change',
  },
  pull_request: {
    target_branch: 'Target branch',
    source_branch: 'Source branch',
    label: 'PR label',
    comment: 'PR comment',
    commit_message: 'Commit message',
    changed_files: 'File change',
  },
  tag: {
    name: 'Tag',
  },
} as const satisfies TargetBasedTriggerMapping;

export const TARGET_BASED_LABELS_MAP: Record<TriggerType, Record<string, string>> = {
  push: {
    branch: 'Push branch',
    commit_message: 'Enter a commit message',
    changed_files: 'Enter a path',
  },
  pull_request: {
    target_branch: 'Enter a target branch',
    source_branch: 'Enter a source branch',
    label: 'Enter a label',
    comment: 'Enter a comment',
    commit_message: 'Enter a commit message',
    changed_files: 'Enter a path',
  },
  tag: {
    name: 'Enter a tag',
  },
} as const satisfies TargetBasedTriggerMapping;
