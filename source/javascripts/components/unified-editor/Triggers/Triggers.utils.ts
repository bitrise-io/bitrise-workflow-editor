import { isObject } from 'es-toolkit/compat';

import { BitriseYml } from '@/core/models/BitriseYml';
import { TriggerSource } from '@/core/models/Trigger';
import WorkflowService from '@/core/services/WorkflowService';

import {
  Condition,
  ConditionType,
  DecoratedPipelineableTriggerItem,
  TargetBasedTriggerItem,
  TriggerType,
} from './Triggers.types';

const looper = (source: TriggerSource, sourceId: string, type: TriggerType, array?: TargetBasedTriggerItem[]) => {
  const decoratedTriggerItems: DecoratedPipelineableTriggerItem[] = [];
  if (array?.length) {
    array.forEach((trigger) => {
      decoratedTriggerItems.push({
        pipelineable: `${source}#${sourceId}`,
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
          looper('pipelines', id, 'pull_request', p.triggers.pull_request),
          looper('pipelines', id, 'push', p.triggers.push),
          looper('pipelines', id, 'tag', p.triggers.tag),
        );
      }
    });
  }
  if (yml.workflows) {
    Object.entries(yml.workflows).forEach(([id, w]) => {
      if (!WorkflowService.isUtilityWorkflow(id) && w.triggers) {
        pipelineableTriggers = pipelineableTriggers.concat(
          looper('workflows', id, 'pull_request', w.triggers.pull_request),
          looper('workflows', id, 'push', w.triggers.push),
          looper('workflows', id, 'tag', w.triggers.tag),
        );
      }
    });
  }

  return pipelineableTriggers;
};

export const getConditionList = (trigger: TargetBasedTriggerItem) => {
  const conditions: Condition[] = [];
  const triggerKeys = Object.keys(trigger) as ConditionType[];
  triggerKeys.forEach((key) => {
    if (!['enabled', 'draft_enabled', 'priority', 'type', 'pipelineable'].includes(key)) {
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
