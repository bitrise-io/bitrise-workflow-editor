import isObject from 'lodash/isObject';
import { TriggerMapYml, TriggerYmlObject } from '@/core/models/TriggerMap';
import { TriggerType, TriggerItem, LegacyConditionType, ConditionType } from './TriggersPage.types';

const convertItemsToTriggerMap = (triggers: Record<TriggerType, TriggerItem[]>): TriggerMapYml => {
  const triggerMap: TriggerMapYml = Object.values(triggers)
    .flat()
    .map((trigger) => {
      const finalItem: TriggerYmlObject = {};
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

const convertTriggerMapToItems = (triggerMap: TriggerMapYml): Record<TriggerType, TriggerItem[]> => {
  const triggers: Record<TriggerType, TriggerItem[]> = {
    pull_request: [],
    push: [],
    tag: [],
  };

  triggerMap.forEach((trigger) => {
    const triggerKeys = Object.keys(trigger) as (keyof TriggerYmlObject)[];
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

export { convertItemsToTriggerMap, convertTriggerMapToItems, getSourceType };
