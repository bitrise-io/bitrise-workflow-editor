import { IterableElement } from 'type-fest';

import {
  PullrequestTriggerModel,
  PushTriggerModel,
  TagTriggerModel,
  TriggerMapItemModel,
  TriggersModel,
} from './BitriseYml';

export type TriggerSource = 'workflows' | 'pipelines';
export type TriggerType = keyof Omit<TriggersModel, 'enabled'>;
export const TYPE_MAP: Record<TriggerType, string> = {
  push: 'Push',
  pull_request: 'Pull request',
  tag: 'Tag',
};

// Legacy triggers types
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
export type LegacyTriggerItemModel = TriggerMapItemModel;
export type LegacyTriggerMapping = {
  [key in TriggerType]: key extends 'push'
    ? Record<LegacyPushConditionType, string>
    : key extends 'pull_request'
      ? Record<LegacyPrConditionType, string>
      : key extends 'tag'
        ? Record<LegacyTagConditionType, string>
        : never;
};

// Target-based triggers types
export type TargetBasedPushConditionType = keyof Omit<IterableElement<TriggersModel['push']>, 'enabled' | 'priority'>;
export type TargetBasedPrConditionType = keyof Omit<
  IterableElement<TriggersModel['pull_request']>,
  'enabled' | 'priority' | 'draft_enabled'
>;
export type TargetBasedTagConditionType = keyof Omit<IterableElement<TriggersModel['tag']>, 'enabled' | 'priority'>;
export type TargetBasedTriggerItemModel = PushTriggerModel & PullrequestTriggerModel & TagTriggerModel;
export type TargetBasedTriggerMapping = {
  [key in TriggerType]: key extends 'push'
    ? Record<TargetBasedPushConditionType, string>
    : key extends 'pull_request'
      ? Record<TargetBasedPrConditionType, string>
      : key extends 'tag'
        ? Record<TargetBasedTagConditionType, string>
        : never;
};

type BaseCondition<TConditionType extends string> = {
  isRegex: boolean;
  type: TConditionType;
  value: string;
  id?: string;
};

export type LegacyPushCondition = BaseCondition<LegacyPushConditionType>;
export type LegacyPrCondition = BaseCondition<LegacyPrConditionType>;
export type LegacyTagCondition = BaseCondition<LegacyTagConditionType>;
export type LegacyCondition = LegacyPushCondition | LegacyPrCondition | LegacyTagCondition;

export type TargetBasedPushCondition = BaseCondition<TargetBasedPushConditionType>;
export type TargetBasedPrCondition = BaseCondition<TargetBasedPrConditionType>;
export type TargetBasedTagCondition = BaseCondition<TargetBasedTagConditionType>;
export type TargetBasedCondition = TargetBasedPushCondition | TargetBasedPrCondition | TargetBasedTagCondition;

type BaseTriggerItem<TConditionType extends string> = {
  uniqueId: string;
  source: `${TriggerSource}#${string}` | '';
  type: TriggerType;
  isActive: boolean;
  conditions: BaseCondition<TConditionType>[];
  isDraftPr?: boolean;
  priority?: number;
};

export type LegacyPushTriggerItem = BaseTriggerItem<LegacyPushConditionType>;
export type LegacyPrTriggerItem = BaseTriggerItem<LegacyPrConditionType>;
export type LegacyTagTriggerItem = BaseTriggerItem<LegacyTagConditionType>;
export type LegacyTrigger = LegacyPushTriggerItem | LegacyPrTriggerItem | LegacyTagTriggerItem;

export type TargetBasedPushTriggerItem = BaseTriggerItem<TargetBasedPushConditionType>;
export type TargetBasedPrTriggerItem = BaseTriggerItem<TargetBasedPrConditionType>;
export type TargetBasedTagTriggerItem = BaseTriggerItem<TargetBasedTagConditionType>;
export type TargetBasedTrigger = TargetBasedPushTriggerItem | TargetBasedPrTriggerItem | TargetBasedTagTriggerItem;
