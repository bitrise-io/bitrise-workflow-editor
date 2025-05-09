import { PullrequestTriggerModel, PushTriggerModel, TagTriggerModel } from '@/core/models/BitriseYml';
import { TriggerSource } from '@/core/models/Trigger';
import { LegacyPrConditionType, LegacyPushConditionType, LegacyTagConditionType } from '@/core/models/Trigger.legacy';
import {
  TargetBasedPrConditionType,
  TargetBasedPushConditionType,
  TargetBasedTagConditionType,
} from '@/core/models/Trigger.target-based';

export type LegacyConditionType = LegacyPushConditionType | LegacyPrConditionType | LegacyTagConditionType;
export type ConditionType = TargetBasedPushConditionType | TargetBasedPrConditionType | TargetBasedTagConditionType;

export type Condition = {
  isRegex: boolean;
  type: ConditionType | LegacyConditionType;
  value: string;
  id?: string;
};

export type TriggerType = 'push' | 'pull_request' | 'tag';

export type TriggerItem = {
  uniqueId: string;
  pipelineable: `${TriggerSource}#${string}` | '';
  conditions: Condition[];
  type: TriggerType;
  isDraftPr?: boolean;
  isActive: boolean;
  priority?: number;
};

export type TargetBasedTriggerItem = PushTriggerModel & PullrequestTriggerModel & TagTriggerModel;

export interface DecoratedPipelineableTriggerItem extends TargetBasedTriggerItem {
  pipelineable: `${TriggerSource}#${string}`;
  type: TriggerType;
}
