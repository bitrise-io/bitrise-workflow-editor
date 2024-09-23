import isEqual from 'lodash/isEqual';
import { isObject } from 'lodash';
import { BitriseYml } from '../../core/models/BitriseYml';
import { Condition, ConditionType, TriggerItem } from './TriggersPage.types';

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

export type PipelineableTriggerItem = (
  | {
      changed_files?: StringOrRegex;
      commit_message?: StringOrRegex;
      comment?: StringOrRegex;
      draft_enabled?: boolean;
      label?: StringOrRegex;
      source_branch?: StringOrRegex;
      target_branch?: StringOrRegex;
      type: 'pull_request';
    }
  | {
      branch?: StringOrRegex;
      changed_files?: StringOrRegex;
      commit_message?: StringOrRegex;
      type: 'push';
    }
  | {
      tag?: StringOrRegex;
      type: 'tag';
    }
) & {
  enabled?: boolean;
  id: string;
  pipelineableType: 'pipeline' | 'workflow';
};

const looper = (
  id: PipelineableTriggerItem['id'],
  pipelineableType: PipelineableTriggerItem['pipelineableType'],
  type: PipelineableTriggerItem['type'],
  array?: any[],
) => {
  const triggerItems: PipelineableTriggerItem[] = [];
  if (array?.length) {
    (array as any[]).forEach((trigger) => {
      triggerItems.push({
        id,
        pipelineableType,
        type,
        ...trigger,
      });
    });
  }
  return triggerItems;
};

type TriggersByPipelineables = Record<string, Record<'pull_request' | 'push' | 'tag', PipelineableTriggerItem[]>>;

export const getPipelineableTriggers = (
  yml: BitriseYml,
): {
  allTriggers: PipelineableTriggerItem[];
  triggersByPipelineables: TriggersByPipelineables;
} => {
  const triggersByPipelineables: TriggersByPipelineables = {};
  if (yml.pipelines) {
    Object.entries(yml.pipelines).forEach(([id, p]) => {
      if (p.triggers) {
        triggersByPipelineables[id] = {
          pull_request: looper(id, 'pipeline', 'pull_request', p.triggers.pull_request as any[]),
          push: looper(id, 'pipeline', 'push', p.triggers.push as any[]),
          tag: looper(id, 'pipeline', 'tag', p.triggers.tag as any[]),
        };
      }
    });
  }
  if (yml.workflows) {
    Object.entries(yml.workflows).forEach(([id, w]) => {
      if (w.triggers) {
        triggersByPipelineables[id] = {
          pull_request: looper(id, 'workflow', 'pull_request', w.triggers.pull_request as any[]),
          push: looper(id, 'workflow', 'push', w.triggers.push as any[]),
          tag: looper(id, 'workflow', 'tag', w.triggers.tag as any[]),
        };
      }
    });
  }

  return {
    allTriggers: Object.values(triggersByPipelineables).map(Object.values).flat(Infinity),
    triggersByPipelineables,
  };
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
