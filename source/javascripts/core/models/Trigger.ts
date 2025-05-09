import { TriggersModel } from './BitriseYml';

export type TriggerSource = 'workflows' | 'pipelines';
export type TriggerType = keyof Omit<TriggersModel, 'enabled'>;
export const TYPE_MAP: Record<TriggerType, string> = {
  push: 'Push',
  pull_request: 'Pull request',
  tag: 'Tag',
};

export type Condition<TConditionType extends string> = {
  isRegex: boolean;
  type: TConditionType;
  value: string;
  id?: string;
};

export type Trigger<TConditionType extends string> = {
  uniqueId: string;
  source: `${TriggerSource}#${string}` | '';
  type: TriggerType;
  isActive: boolean;
  conditions: Condition<TConditionType>[];
  isDraftPr?: boolean;
  priority?: number;
};
