import isEqual from 'lodash/isEqual';

export type TagConditionType = 'tag';

export type PushConditionType = 'push_branch' | 'commit_message' | 'changed_files';

export type PrConditionType =
  | 'pull_request_source_branch'
  | 'pull_request_target_branch'
  | 'pull_request_label'
  | 'pull_request_comment'
  | 'commit_message'
  | 'changed_files';

export type ConditionType = PushConditionType | PrConditionType | TagConditionType;

export type Condition = {
  isRegex: boolean;
  type: ConditionType;
  value: string;
  id?: string;
};

export type SourceType = 'push' | 'pull_request' | 'tag';

export type TriggerItem = {
  conditions: Condition[];
  pipelineable: string;
  id: string;
  source: SourceType;
  isDraftPr?: boolean;
  isActive: boolean;
};

export const checkIsConditionsUsed = (currentTriggers: TriggerItem[], newTrigger: TriggerItem) => {
  let isUsed = false;
  currentTriggers.forEach(({ conditions, id }) => {
    isUsed = isEqual(conditions, newTrigger.conditions) && id !== newTrigger.id;
  });
  return isUsed;
};
