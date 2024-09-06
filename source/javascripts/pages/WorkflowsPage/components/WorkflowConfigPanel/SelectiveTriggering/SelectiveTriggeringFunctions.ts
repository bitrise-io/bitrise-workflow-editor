import { isObject } from 'angular';
import { ConditionType, FinalTriggerItem, SourceType, TriggerItem } from '../../../../TriggersPage/TriggersPage.types';

const convertItemsToTriggerMap = (triggers: Record<SourceType, TriggerItem[]>): FinalTriggerItem[] => {
  const triggerMap: FinalTriggerItem[] = Object.values(triggers)
    .flat()
    .map((trigger) => {
      const finalItem: FinalTriggerItem = {};
      trigger.conditions.forEach(({ isRegex, type, value }) => {
        finalItem[type] = isRegex ? { regex: value } : value;
      });
      if (!trigger.isActive) {
        finalItem.enabled = false;
      }
      if (trigger.source === 'pull_request' && !trigger.isDraftPr) {
        finalItem.draft_pull_request_enabled = false;
      }
      finalItem.type = trigger.source;
      const [pipelinableType, pipelinableName] = trigger.pipelineable.split('#');
      finalItem[pipelinableType] = pipelinableName;
      return finalItem;
    });

  return triggerMap;
};

const getSourceType = (triggerKeys: string[], type?: SourceType): SourceType => {
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

const convertTriggerMapToItems = (triggerMap: FinalTriggerItem[]): Record<SourceType, TriggerItem[]> => {
  const triggers: Record<SourceType, TriggerItem[]> = {
    pull_request: [],
    push: [],
    tag: [],
  };
  triggerMap.forEach((trigger) => {
    const triggerKeys = Object.keys(trigger);
    const source = getSourceType(triggerKeys, trigger.type as SourceType);
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
