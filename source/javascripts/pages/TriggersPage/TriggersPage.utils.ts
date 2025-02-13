import { isEqual } from 'es-toolkit';
import { isObject } from 'es-toolkit/compat';
import {
  ConditionType,
  TriggerItem,
  TriggerType,
  LegacyConditionType,
} from '@/components/unified-editor/Triggers/Triggers.types';
import { TriggerMap, TriggerMapItemModel } from '@/core/models/BitriseYml';

const getSourceType = (triggerKeys: string[], type?: TriggerType): TriggerType => {
  if (type) {
    return type;
  }
  if (triggerKeys.includes('push_branch')) {
    return 'push';
  }
  if (triggerKeys.includes('tag')) {
    return 'tag';
  }
  return 'pull_request';
};

export const convertItemsToTriggerMap = (triggers: Record<TriggerType, TriggerItem[]>): TriggerMap => {
  const triggerMap: TriggerMap = Object.values(triggers)
    .flat()
    .map((trigger) => {
      const finalItem: TriggerMapItemModel = {};
      trigger.conditions.forEach(({ isRegex, type, value }) => {
        finalItem[type as LegacyConditionType] = isRegex ? { regex: value } : value;
      });
      if (!trigger.isActive) {
        finalItem.enabled = false;
      }
      if (trigger.source === 'pull_request' && !trigger.isDraftPr) {
        finalItem.draft_pull_request_enabled = false;
      }
      finalItem.type = trigger.source;
      const [pipelinableType, pipelinableName] = trigger.pipelineable.split('#');
      finalItem[pipelinableType as 'workflow' | 'pipeline'] = pipelinableName;
      return finalItem;
    });

  return triggerMap;
};

export const convertTriggerMapToItems = (triggerMap: TriggerMap): Record<TriggerType, TriggerItem[]> => {
  const triggers: Record<TriggerType, TriggerItem[]> = {
    pull_request: [],
    push: [],
    tag: [],
  };

  triggerMap.forEach((trigger) => {
    const triggerKeys = Object.keys(trigger) as (keyof TriggerMapItemModel)[];
    const source = getSourceType(triggerKeys, trigger.type as TriggerType);
    const finalItem: TriggerItem = {
      conditions: [],
      pipelineable: trigger.workflow as string,
      id: crypto.randomUUID(),
      source,
      isActive: trigger.enabled !== false,
    };

    if (source === 'pull_request') {
      if (trigger.draft_pull_request_enabled !== false) {
        finalItem.isDraftPr = true;
      } else {
        finalItem.isDraftPr = false;
      }
    }

    if (trigger.workflow) {
      finalItem.pipelineable = `workflow#${trigger.workflow}`;
    }
    if (trigger.pipeline) {
      finalItem.pipelineable = `pipeline#${trigger.pipeline}`;
    }

    triggerKeys.forEach((key) => {
      if (!['workflow', 'enabled', 'draft_pull_request_enabled', 'type', 'pipeline'].includes(key)) {
        const isRegex = isObject(trigger[key]);
        finalItem.conditions.push({
          isRegex,
          type: key as ConditionType,
          value: isRegex ? (trigger[key] as { regex: string }).regex : (trigger[key] as string),
        });
      }
    });
    triggers[source].push(finalItem);
  });
  return triggers;
};

export const checkIsConditionsUsed = (currentTriggers: TriggerItem[], newTrigger: TriggerItem) => {
  let isUsed = false;
  currentTriggers.forEach(({ conditions, id }) => {
    const newConditions = newTrigger.conditions.map((c) => {
      if (c.value === '') {
        return {
          ...c,
          value: '*',
        };
      }
      return c;
    });
    conditions.forEach((c) => {
      newConditions.forEach((newC) => {
        if (isEqual(c, newC) && id !== newTrigger.id) {
          isUsed = true;
        }
      });
    });
  });
  return isUsed;
};
