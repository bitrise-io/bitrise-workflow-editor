import { IterableElement } from 'type-fest';

import { PullrequestTriggerModel, PushTriggerModel, TagTriggerModel, TriggersModel } from '@/core/models/BitriseYml';
import { Condition, Trigger, TriggerType } from '@/core/models/Trigger';

export type TargetBasedPushConditionType = keyof Omit<IterableElement<TriggersModel['push']>, 'enabled' | 'priority'>;
export type TargetBasedPrConditionType = keyof Omit<
  IterableElement<TriggersModel['pull_request']>,
  'enabled' | 'priority' | 'draft_enabled'
>;
export type TargetBasedTagConditionType = keyof Omit<IterableElement<TriggersModel['tag']>, 'enabled' | 'priority'>;
export type TargetBasedTriggerItemModel = PushTriggerModel & PullrequestTriggerModel & TagTriggerModel;

export type TargetBasedPushCondition = Condition<TargetBasedPushConditionType>;
export type TargetBasedPrCondition = Condition<TargetBasedPrConditionType>;
export type TargetBasedTagCondition = Condition<TargetBasedTagConditionType>;
export type TargetBasedCondition = TargetBasedPushCondition | TargetBasedPrCondition | TargetBasedTagCondition;

export type TargetBasedPushTriggerItem = Trigger<TargetBasedPushConditionType>;
export type TargetBasedPrTriggerItem = Trigger<TargetBasedPrConditionType>;
export type TargetBasedTagTriggerItem = Trigger<TargetBasedTagConditionType>;
export type TargetBasedTrigger = TargetBasedPushTriggerItem | TargetBasedPrTriggerItem | TargetBasedTagTriggerItem;

export type TargetBasedTriggerMapping = {
  [key in TriggerType]: key extends 'push'
    ? Record<TargetBasedPushConditionType, string>
    : key extends 'pull_request'
      ? Record<TargetBasedPrConditionType, string>
      : key extends 'tag'
        ? Record<TargetBasedTagConditionType, string>
        : never;
};

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
