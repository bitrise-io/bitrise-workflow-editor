import { isObject } from 'es-toolkit/compat';
import { BitriseYml } from '@/core/models/BitriseYml';
import WorkflowService from '@/core/models/WorkflowService';
import {
  DecoratedPipelineableTriggerItem,
  TriggerType,
  TargetBasedTriggerItem,
  Condition,
  ConditionType,
} from './Triggers.types';

const looper = (
  pipelineableId: string,
  pipelineableType: DecoratedPipelineableTriggerItem['pipelineableType'],
  type: TriggerType,
  array?: TargetBasedTriggerItem[],
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
          looper(id, 'pipeline', 'pull_request', p.triggers.pull_request as TargetBasedTriggerItem[]),
          looper(id, 'pipeline', 'push', p.triggers.push as TargetBasedTriggerItem[]),
          looper(id, 'pipeline', 'tag', p.triggers.tag as TargetBasedTriggerItem[]),
        );
      }
    });
  }
  if (yml.workflows) {
    Object.entries(yml.workflows).forEach(([id, w]) => {
      if (!WorkflowService.isUtilityWorkflow(id) && w.triggers) {
        pipelineableTriggers = pipelineableTriggers.concat(
          looper(id, 'workflow', 'pull_request', w.triggers.pull_request as TargetBasedTriggerItem[]),
          looper(id, 'workflow', 'push', w.triggers.push as TargetBasedTriggerItem[]),
          looper(id, 'workflow', 'tag', w.triggers.tag as TargetBasedTriggerItem[]),
        );
      }
    });
  }

  return pipelineableTriggers;
};

export const getConditionList = (trigger: TargetBasedTriggerItem) => {
  const conditions: Condition[] = [];
  const triggerKeys = Object.keys(trigger) as (keyof TargetBasedTriggerItem)[];
  triggerKeys.forEach((key) => {
    if (!['enabled', 'pipelineableId', 'pipelineableType', 'type', 'draft_enabled', 'priority'].includes(key)) {
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
