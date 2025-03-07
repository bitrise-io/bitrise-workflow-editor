import { PullrequestTriggerModel, PushTriggerModel, TagTriggerModel } from '@/core/models/BitriseYml';

export type LegacyTagConditionType = 'tag';

export type TagConditionType = 'name';

export type LegacyPushConditionType = 'push_branch' | 'commit_message' | 'changed_files';

export type PushConditionType = 'branch' | 'commit_message' | 'changed_files';

export type LegacyPrConditionType =
  | 'pull_request_source_branch'
  | 'pull_request_target_branch'
  | 'pull_request_label'
  | 'pull_request_comment'
  | 'commit_message'
  | 'changed_files';

export type PrConditionType =
  | 'source_branch'
  | 'target_branch'
  | 'label'
  | 'comment'
  | 'commit_message'
  | 'changed_files';

export type LegacyConditionType = LegacyPushConditionType | LegacyPrConditionType | LegacyTagConditionType;

export type ConditionType = PushConditionType | PrConditionType | TagConditionType;

export type Condition = {
  isRegex: boolean;
  type: ConditionType | LegacyConditionType;
  value: string;
  id?: string;
};

export type TriggerType = 'push' | 'pull_request' | 'tag';

export type TriggerItem = {
  conditions: Condition[];
  pipelineable: string;
  id: string;
  source: TriggerType;
  isDraftPr?: boolean;
  isActive: boolean;
  priority?: number;
};

export interface FormItems extends Omit<TriggerItem, 'conditions'> {
  conditions: {
    isRegex: boolean;
    type?: ConditionType | LegacyConditionType | '';
    value: string;
  }[];
}

export type TargetBasedTriggerItem = PushTriggerModel & PullrequestTriggerModel & TagTriggerModel;

export interface DecoratedPipelineableTriggerItem extends TargetBasedTriggerItem {
  pipelineableId: string;
  pipelineableType: 'pipeline' | 'workflow';
  type: TriggerType;
}
