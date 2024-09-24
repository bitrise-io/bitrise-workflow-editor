import isEqual from 'lodash/isEqual';
import { isObject } from 'lodash';
import { BitriseYml } from '../../../../core/models/BitriseYml';
import { TriggerItem, Condition, ConditionType, TriggerType } from './TriggersPage.types';

export const checkIsConditionsUsed = (currentTriggers: TriggerItem[], newTrigger: TriggerItem) => {
  let isUsed = false;
  currentTriggers.forEach(({ conditions, id }) => {
    isUsed = isEqual(conditions, newTrigger.conditions) && id !== newTrigger.id;
  });
  return isUsed;
};

type StringOrRegex =
  | string
  | {
      regex: string;
    };

export type PipelineableTriggerItem = {
  branch?: StringOrRegex;
  changed_files?: StringOrRegex;
  commit_message?: StringOrRegex;
  comment?: StringOrRegex;
  draft_enabled?: boolean;
  enabled?: boolean;
  label?: StringOrRegex;
  source_branch?: StringOrRegex;
  target_branch?: StringOrRegex;
  tag?: StringOrRegex;
};

export interface DecoratedPipelineableTriggerItem extends PipelineableTriggerItem {
  pipelineableId: string;
  pipelineableType: 'pipeline' | 'workflow';
  type: TriggerType;
}

const looper = (
  pipelineableId: string,
  pipelineableType: DecoratedPipelineableTriggerItem['pipelineableType'],
  type: TriggerType,
  array?: PipelineableTriggerItem[],
) => {
  const decoratedTriggerItems: DecoratedPipelineableTriggerItem[] = [];
  if (array?.length) {
    array.forEach((trigger) => {
      decoratedTriggerItems.push({
        pipelineableId,
        pipelineableType,
        type,
        ...trigger,
      });
    });
  }
  return decoratedTriggerItems;
};

export const getPipelineableTriggers = (yml: BitriseYml) => {
  let pipelineableTriggers: DecoratedPipelineableTriggerItem[] = [];
  if (yml.pipelines) {
    Object.entries(yml.pipelines).forEach(([id, p]) => {
      if (p.triggers) {
        pipelineableTriggers = pipelineableTriggers.concat(
          looper(id, 'pipeline', 'pull_request', p.triggers.pull_request as PipelineableTriggerItem[]),
          looper(id, 'pipeline', 'push', p.triggers.push as PipelineableTriggerItem[]),
          looper(id, 'pipeline', 'tag', p.triggers.tag as PipelineableTriggerItem[]),
        );
      }
    });
  }
  if (yml.workflows) {
    Object.entries(yml.workflows).forEach(([id, w]) => {
      if (w.triggers) {
        pipelineableTriggers = pipelineableTriggers.concat(
          looper(id, 'workflow', 'pull_request', w.triggers.pull_request as PipelineableTriggerItem[]),
          looper(id, 'workflow', 'push', w.triggers.push as PipelineableTriggerItem[]),
          looper(id, 'workflow', 'tag', w.triggers.tag as PipelineableTriggerItem[]),
        );
      }
    });
  }

  return pipelineableTriggers;
};

export const getConditionList = (trigger: PipelineableTriggerItem) => {
  const conditions: Condition[] = [];
  const triggerKeys = Object.keys(trigger) as (keyof PipelineableTriggerItem)[];
  triggerKeys.forEach((key) => {
    if (!['enabled', 'id', 'pipelineableType', 'type', 'draft_enabled'].includes(key)) {
      const isRegex = isObject(trigger[key]);
      conditions.push({
        isRegex,
        type: key as ConditionType,
        value: isRegex ? (trigger[key] as any).regex : (trigger[key] as string),
      });
    }
  });
  return conditions;
};
