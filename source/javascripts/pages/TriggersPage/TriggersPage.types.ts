import { TypeIconName } from '@bitrise/bitkit';

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
  workflowId?: string;
  hasWorkspace?: boolean;
};

export const iconMap: Record<PushConditionType | PrConditionType | TagConditionType, TypeIconName> = {
  push_branch: 'Branch',
  commit_message: 'Commit',
  changed_files: 'Doc',
  pull_request_source_branch: 'Pull',
  pull_request_target_branch: 'Pull',
  pull_request_label: 'Tag',
  pull_request_comment: 'Chat',
  tag: 'Tag',
};

export const toolTip: Record<PushConditionType | PrConditionType | TagConditionType, string> = {
  push_branch: 'Push branch',
  commit_message: 'Commit message',
  changed_files: 'File change',
  pull_request_source_branch: 'Source branch',
  pull_request_target_branch: 'Target branch',
  pull_request_label: 'PR label',
  pull_request_comment: 'PR comment',
  tag: 'Tag',
};
