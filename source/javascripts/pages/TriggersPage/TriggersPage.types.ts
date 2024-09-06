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

export interface FormItems extends Omit<TriggerItem, 'conditions'> {
  conditions: {
    isRegex: boolean;
    type?: ConditionType | '';
    value: string;
  }[];
  isDraftPr?: boolean;
  isActive: boolean;
}

export type FinalTriggerItem = Record<string, boolean | string | { regex: string }>;

export type TriggersPageProps = {
  integrationsUrl?: string;
  isWebsiteMode: boolean;
  onTriggerMapChange: (triggerMap: FinalTriggerItem[]) => void;
  pipelines: string[];
  setDiscard: (fn: (triggerMap: FinalTriggerItem[]) => void) => void;
  triggerMap?: FinalTriggerItem[];
  workflows: string[];
};
