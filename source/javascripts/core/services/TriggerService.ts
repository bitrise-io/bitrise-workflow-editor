import { isEqual, pick } from 'es-toolkit';
import { isObject } from 'es-toolkit/compat';
import { Document, isMap, isSeq } from 'yaml';

import { TriggerMap, TriggerMapItemModel, TriggersModel } from '../models/BitriseYml';
import {
  ALL_TARGET_BASED_CONDITION_TYPES,
  TargetBasedConditionType,
  TargetBasedTrigger,
  TargetBasedTriggerItemModel,
  TriggerSource,
  TriggerType,
} from '../models/Trigger';
import { ALL_LEGACY_CONDITION_TYPES, LegacyConditionType, LegacyTrigger } from '../models/Trigger.legacy';
import { updateBitriseYmlDocument } from '../stores/BitriseYmlStore';
import YamlUtils from '../utils/YamlUtils';

function toLegacyTriggers(triggerMap?: TriggerMap): Record<TriggerType, LegacyTrigger[]> {
  const legacyTriggers: Record<TriggerType, LegacyTrigger[]> = {
    push: [],
    pull_request: [],
    tag: [],
  };

  if (!triggerMap) {
    return legacyTriggers;
  }

  function toTriggerType(trigger: TriggerMapItemModel): TriggerType {
    if (trigger.type) {
      return trigger.type;
    }

    if ('push_branch' in trigger) {
      return 'push';
    }
    if ('tag' in trigger) {
      return 'tag';
    }
    return 'pull_request';
  }

  function toConditions(trigger: TriggerMapItemModel) {
    const conditions = pick(trigger, ALL_LEGACY_CONDITION_TYPES);

    return Object.entries(conditions).map(([key, value]) => {
      const isRegex = isObject(value) && 'regex' in value && typeof value.regex === 'string';

      return {
        isRegex: isObject(value) && 'regex' in value && typeof value.regex === 'string',
        type: key as LegacyConditionType,
        value: isRegex ? value.regex : String(value),
      };
    });
  }

  triggerMap.forEach((trigger, index) => {
    const triggerType = toTriggerType(trigger);

    const finalItem: LegacyTrigger = {
      uniqueId: crypto.randomUUID(),
      index,
      source: '',
      triggerType,
      conditions: toConditions(trigger),
      isActive: trigger.enabled !== false,
    };

    if (triggerType === 'pull_request') {
      finalItem.isDraftPr = trigger.draft_pull_request_enabled !== false;
    }
    if (trigger.workflow) {
      finalItem.source = `workflows#${trigger.workflow}`;
    }
    if (trigger.pipeline) {
      finalItem.source = `pipelines#${trigger.pipeline}`;
    }

    legacyTriggers[triggerType].push(finalItem);
  });

  return legacyTriggers;
}

function toTriggerMapItemModel(trigger: LegacyTrigger): TriggerMapItemModel {
  const [target, targetId] = trigger.source.split('#') as [TriggerSource, string];

  const item: TriggerMapItemModel = { type: trigger.triggerType };
  if (target === 'pipelines') {
    item.pipeline = targetId;
  }

  if (target === 'workflows') {
    item.workflow = targetId;
  }

  trigger.conditions.forEach(({ isRegex, type, value }) => {
    item[type] = isRegex ? { regex: value } : value;
  });

  if (trigger.triggerType === 'pull_request' && trigger.isDraftPr === false) {
    item.draft_pull_request_enabled = false;
  }

  if (trigger.isActive === false) {
    item.enabled = false;
  }

  return item;
}

function toTriggerMap(triggers: Record<TriggerType, LegacyTrigger[]>): TriggerMap {
  return Object.values(triggers).flat().map(toTriggerMapItemModel);
}

function isLegacyConditionUsed(currentTriggers: LegacyTrigger[], newTrigger: LegacyTrigger) {
  const newConditions = newTrigger.conditions.map((c) => ({
    ...c,
    value: c.value === '' ? '*' : c.value,
  }));

  return currentTriggers.some(
    (trigger) =>
      trigger.uniqueId !== newTrigger.uniqueId &&
      trigger.conditions.some((c) => newConditions.some((newC) => isEqual(c, newC))),
  );
}

function toTargetBasedTriggers(
  source: TriggerSource,
  sourceId: string,
  triggersModel: TriggersModel,
): Record<TriggerType, TargetBasedTrigger[]> {
  const triggers: Record<TriggerType, TargetBasedTrigger[]> = {
    push: [],
    pull_request: [],
    tag: [],
  };

  function toConditions(trigger: TargetBasedTriggerItemModel) {
    const conditions = pick(trigger, ALL_TARGET_BASED_CONDITION_TYPES);

    return Object.entries(conditions).map(([key, value]) => {
      const isRegex = isObject(value) && 'regex' in value && typeof value.regex === 'string';

      return {
        isRegex,
        type: key as TargetBasedConditionType,
        value: isRegex ? value.regex : String(value),
      };
    });
  }

  function toTriggers(triggerType: TriggerType, array?: TargetBasedTriggerItemModel[]) {
    return (
      array?.map<TargetBasedTrigger>((trigger, index) => ({
        triggerType,
        index,

        uniqueId: crypto.randomUUID(),
        source: `${source}#${sourceId}`,
        isActive: trigger.enabled !== false,
        isDraftPr: trigger.draft_enabled,
        priority: trigger.priority,
        conditions: toConditions(trigger),
      })) || []
    );
  }

  triggers.push = toTriggers('push', triggersModel.push);
  triggers.pull_request = toTriggers('pull_request', triggersModel.pull_request);
  triggers.tag = toTriggers('tag', triggersModel.tag);

  return triggers;
}

function toTargetBasedItemModel(trigger: TargetBasedTrigger): TargetBasedTriggerItemModel {
  const item = { priority: trigger.priority } as TargetBasedTriggerItemModel;

  if (trigger.isActive === false) {
    item.enabled = false;
  }

  if (trigger.triggerType === 'pull_request' && trigger.isDraftPr === false) {
    item.draft_enabled = false;
  }

  trigger.conditions.forEach(({ isRegex, type, value }) => {
    item[type] = isRegex ? { regex: value } : value;
  });

  return item;
}

// Legacy triggers
function getTriggerMapOrThrowError(doc: Document) {
  const triggerMap = doc.getIn(['trigger_map']);
  if (!triggerMap || !isSeq(triggerMap)) {
    throw new Error('trigger_map not found');
  }

  return triggerMap;
}

function getTriggerMapItemOrThrowError(doc: Document, index: number) {
  const triggerMap = getTriggerMapOrThrowError(doc);

  const trigger = triggerMap.getIn([index]);
  if (!trigger || !isMap(trigger)) {
    throw new Error(`Trigger is not found at path trigger_map.${index}`);
  }

  return trigger;
}

function addLegacyTrigger(trigger: LegacyTrigger) {
  updateBitriseYmlDocument(({ doc }) => {
    const triggerMap = YamlUtils.getSeqIn(doc, ['trigger_map'], true);
    triggerMap.flow = false;
    triggerMap.add(toTriggerMapItemModel(trigger));
    return doc;
  });
}

function updateLegacyTrigger(trigger: LegacyTrigger) {
  updateBitriseYmlDocument(({ doc }) => {
    getTriggerMapItemOrThrowError(doc, trigger.index);
    doc.setIn(['trigger_map', trigger.index], toTriggerMapItemModel(trigger));
    return doc;
  });
}

function removeLegacyTrigger(index: number) {
  updateBitriseYmlDocument(({ doc }) => {
    getTriggerMapItemOrThrowError(doc, index);
    YamlUtils.safeDeleteIn(doc, ['trigger_map', index], ['trigger_map']);
    return doc;
  });
}

function updateTriggerMap(triggers: Record<TriggerType, LegacyTrigger[]>) {
  updateBitriseYmlDocument(({ doc }) => {
    doc.set('trigger_map', toTriggerMap(triggers));
    return doc;
  });
}

// Target-based triggers
function getSourceOrThrowError(doc: Document, at: { source: TriggerSource; sourceId: string }) {
  const { source, sourceId } = at;
  const entity = doc.getIn([source, sourceId]);

  if (!entity || !isMap(entity)) {
    throw new Error(`${source}.${sourceId} not found`);
  }

  return entity;
}

function getTriggerOrThrowError(
  doc: Document,
  at: { source: TriggerSource; sourceId: string; triggerType: TriggerType; index: number },
) {
  const { source, sourceId, triggerType, index } = at;
  const entity = getSourceOrThrowError(doc, { source, sourceId });
  const trigger = entity.getIn(['triggers', triggerType, index]);

  if (!trigger || !isMap(trigger)) {
    throw new Error(`Trigger is not found at path ${source}.${sourceId}.triggers.${triggerType}.${index}`);
  }

  return trigger;
}

function updateEnabled(enabled: boolean, at: { source: TriggerSource; sourceId: string }) {
  updateBitriseYmlDocument(({ doc }) => {
    const { source, sourceId } = at;
    const entity = getSourceOrThrowError(doc, at);

    if (enabled) {
      YamlUtils.safeDeleteIn(doc, [source, sourceId, 'triggers', 'enabled'], ['triggers']);
      return doc;
    }

    entity.flow = false;
    const triggers = YamlUtils.getMapIn(doc, [source, sourceId, 'triggers'], true);
    triggers.flow = false;
    triggers.set('enabled', false);

    return doc;
  });
}

function addTrigger(trigger: TargetBasedTrigger) {
  updateBitriseYmlDocument(({ doc }) => {
    const [source, sourceId] = trigger.source.split('#') as [TriggerSource, string];
    const entity = getSourceOrThrowError(doc, { source, sourceId });
    entity.flow = false;

    const triggers = YamlUtils.getSeqIn(doc, [source, sourceId, 'triggers', trigger.triggerType], true);
    triggers.add(toTargetBasedItemModel(trigger));

    return doc;
  });
}

function updateTrigger(trigger: TargetBasedTrigger) {
  updateBitriseYmlDocument(({ doc }) => {
    const [source, sourceId] = trigger.source.split('#') as [TriggerSource, string];
    getTriggerOrThrowError(doc, { source, sourceId, triggerType: trigger.triggerType, index: trigger.index });

    doc.setIn([source, sourceId, 'triggers', trigger.triggerType, trigger.index], toTargetBasedItemModel(trigger));

    return doc;
  });
}

function updateTriggerEnabled(trigger: TargetBasedTrigger) {
  updateBitriseYmlDocument(({ doc }) => {
    const [source, sourceId] = trigger.source.split('#') as [TriggerSource, string];
    const entity = getTriggerOrThrowError(doc, {
      source,
      sourceId,
      triggerType: trigger.triggerType,
      index: trigger.index,
    });

    if (trigger.isActive) {
      YamlUtils.safeDeleteIn(
        doc,
        [source, sourceId, 'triggers', trigger.triggerType, trigger.index, 'enabled'],
        ['triggers', trigger.triggerType, trigger.index],
      );
      return doc;
    }

    entity.flow = false;
    entity.set('enabled', false);

    return doc;
  });
}

function removeTrigger(trigger: TargetBasedTrigger) {
  updateBitriseYmlDocument(({ doc }) => {
    const [source, sourceId] = trigger.source.split('#') as [TriggerSource, string];
    getTriggerOrThrowError(doc, { source, sourceId, triggerType: trigger.triggerType, index: trigger.index });

    YamlUtils.safeDeleteIn(
      doc,
      [source, sourceId, 'triggers', trigger.triggerType, trigger.index],
      ['triggers', trigger.triggerType],
    );

    return doc;
  });
}

export default {
  toLegacyTriggers,
  isLegacyConditionUsed,
  toTargetBasedTriggers,
  addLegacyTrigger,
  updateLegacyTrigger,
  removeLegacyTrigger,
  updateTriggerMap,
  updateEnabled,
  addTrigger,
  updateTrigger,
  updateTriggerEnabled,
  removeTrigger,
};
