import isEqual from 'lodash/isEqual';
import { BitriseYml } from '../../core/models/BitriseYml';
import { TriggerItem } from './TriggersPage.types';

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

type PipelineableTriggerItem = (
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

export const getPipelineableTriggers = (yml: BitriseYml) => {
  let triggerItems: PipelineableTriggerItem[] = [];
  if (yml.pipelines) {
    Object.entries(yml.pipelines).forEach(([id, p]) => {
      if (p.triggers) {
        triggerItems = triggerItems.concat(
          looper(id, 'pipeline', 'pull_request', p.triggers.pull_request as any[]),
          looper(id, 'pipeline', 'push', p.triggers.push as any[]),
          looper(id, 'pipeline', 'tag', p.triggers.tag as any[]),
        );
      }
    });
  }
  if (yml.workflows) {
    Object.entries(yml.workflows).forEach(([id, w]) => {
      if (w.triggers) {
        triggerItems = triggerItems.concat(
          looper(id, 'workflow', 'pull_request', w.triggers.pull_request as any[]),
          looper(id, 'workflow', 'push', w.triggers.push as any[]),
          looper(id, 'workflow', 'tag', w.triggers.tag as any[]),
        );
      }
    });
  }
  return triggerItems;
};
