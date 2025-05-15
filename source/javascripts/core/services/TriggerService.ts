import { isEqual, pick } from 'es-toolkit';
import { isObject } from 'es-toolkit/compat';
import { Document, isMap, isSeq, Pair } from 'yaml';

import {
  TriggerMap,
  TriggerMapItemModel,
  TriggerMapItemModelRegexCondition,
  TriggersModel,
} from '../models/BitriseYml';
import {
  ALL_TARGET_BASED_CONDITION_TYPES,
  TargetBasedCondition,
  TargetBasedConditionType,
  TargetBasedTrigger,
  TargetBasedTriggerItemModel,
  TriggerSource,
  TriggerType,
} from '../models/Trigger';
import {
  ALL_LEGACY_CONDITION_TYPES,
  LEGACY_TO_TARGET_BASED_CONDITION_MAP,
  LegacyCondition,
  LegacyConditionType,
  LegacyTrigger,
} from '../models/Trigger.legacy';
import { updateBitriseYmlDocument } from '../stores/BitriseYmlStore';
import YamlUtils from '../utils/YamlUtils';

function cleanConditionValue(value: string, isRegex: boolean) {
  const trimmed = value.trim();

  if (trimmed === '') {
    return isRegex ? '.*' : '*';
  }

  if (isRegex && trimmed === '*') {
    return '.*';
  }

  if (!isRegex && trimmed === '.*') {
    return '*';
  }

  return trimmed;
}

// Legacy triggers
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

function fromLegacyCondition({ isRegex, value }: LegacyCondition): TriggerMapItemModelRegexCondition {
  const finalValue = cleanConditionValue(value, Boolean(isRegex));

  return isRegex ? { regex: finalValue } : finalValue;
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

  // eslint-disable-next-line no-return-assign
  trigger.conditions.forEach((c) => (item[c.type] = fromLegacyCondition(c)));

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
  let isUsed = false;
  currentTriggers.forEach(({ conditions, index }) => {
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
        if (isEqual(c, newC) && index !== newTrigger.index) {
          isUsed = true;
        }
      });
    });
  });
  return isUsed;
}

function convertToTargetBasedTrigger(trigger: LegacyTrigger): TargetBasedTrigger {
  return {
    ...trigger,
    conditions: trigger.conditions.map(({ isRegex, type, value }) => ({
      isRegex,
      type: LEGACY_TO_TARGET_BASED_CONDITION_MAP[type],
      value,
    })),
  };
}

function getTriggerMapOrThrowError(doc: Document) {
  const triggerMap = YamlUtils.getSeqIn(doc, ['trigger_map']);
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
    triggerMap.add(doc.createNode(toTriggerMapItemModel(trigger)));
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

function updateLegacyTriggerEnabled(enabled: boolean, index: number) {
  updateBitriseYmlDocument(({ doc }) => {
    const trigger = getTriggerMapItemOrThrowError(doc, index);
    if (enabled) {
      YamlUtils.safeDeleteIn(doc, ['trigger_map', index, 'enabled'], ['trigger_map']);
      return doc;
    }
    trigger.set('enabled', false);
    return doc;
  });
}

function updateLegacyTrigger(trigger: LegacyTrigger) {
  updateBitriseYmlDocument(({ doc }) => {
    getTriggerMapItemOrThrowError(doc, trigger.index);
    doc.setIn(['trigger_map', trigger.index], doc.createNode(toTriggerMapItemModel(trigger)));
    return doc;
  });
}

function updateTriggerMap(triggers?: Record<TriggerType, LegacyTrigger[]>) {
  updateBitriseYmlDocument(({ doc }) => {
    if (!triggers) {
      doc.delete('trigger_map');
      return doc;
    }

    doc.setIn(['trigger_map'], doc.createNode(toTriggerMap(triggers)));
    return doc;
  });
}

// Target-based triggers
function toTargetBasedTriggers(
  source: TriggerSource,
  sourceId: string,
  triggersModel?: TriggersModel,
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
      const isPattern = isObject(value) && 'pattern' in value && typeof value.pattern === 'string';
      const isLastCommitOnly = isObject(value) && 'last_commit' in value && value.last_commit;
      // eslint-disable-next-line no-nested-ternary
      const conditionValue = isRegex ? value.regex : isPattern ? value.pattern : String(value);

      const condition: TargetBasedCondition = {
        isRegex,
        type: key as TargetBasedConditionType,
        value: conditionValue,
      };

      if (isLastCommitOnly) {
        condition.isLastCommitOnly = true;
      }

      return condition;
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

  triggers.push = toTriggers('push', triggersModel?.push);
  triggers.pull_request = toTriggers('pull_request', triggersModel?.pull_request);
  triggers.tag = toTriggers('tag', triggersModel?.tag);

  return triggers;
}

function fromTargetBasedCondition({
  isRegex,
  type,
  value,
  isLastCommitOnly,
}: TargetBasedCondition): TriggerMapItemModelRegexCondition {
  const canHaveLastCommit = ['commit_message', 'changed_files'].includes(type);

  const finalValue = cleanConditionValue(value, Boolean(isRegex));

  if (isRegex) {
    return isLastCommitOnly && canHaveLastCommit ? { regex: finalValue, last_commit: true } : { regex: finalValue };
  }

  if (canHaveLastCommit) {
    return isLastCommitOnly ? { pattern: finalValue, last_commit: true } : finalValue;
  }

  return finalValue;
}

function toTargetBasedItemModel(trigger: TargetBasedTrigger): TargetBasedTriggerItemModel {
  const item = {} as TargetBasedTriggerItemModel;

  trigger.conditions.forEach((cond) => {
    item[cond.type] = fromTargetBasedCondition(cond);
  });

  if (trigger.triggerType === 'pull_request' && trigger.isDraftPr === false) {
    item.draft_enabled = false;
  }

  if (trigger.priority !== undefined) {
    item.priority = trigger.priority;
  }

  if (!trigger.isActive) {
    item.enabled = false;
  }

  return item;
}

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

function getTriggerConditionOrThrowError(
  doc: Document,
  at: { source: TriggerSource; sourceId: string; triggerType: TriggerType; index: number; conditionType: string },
) {
  const { source, sourceId, triggerType, index, conditionType } = at;
  const entity = getTriggerOrThrowError(doc, { source, sourceId, triggerType, index });
  const condition = entity.get(conditionType) as Pair<TargetBasedConditionType, TriggerMapItemModelRegexCondition>;

  if (!condition) {
    throw new Error(
      `Condition ${conditionType} not found at path ${source}.${sourceId}.triggers.${triggerType}.${index}`,
    );
  }

  return condition;
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

function changeTriggerEnabled(
  doc: Document,
  enabled: boolean,
  at: { source: TriggerSource; sourceId: string; triggerType: TriggerType; index: number },
) {
  const trigger = getTriggerOrThrowError(doc, at);

  if (enabled) {
    trigger.delete('enabled');
    return;
  }

  trigger.flow = false;
  trigger.set('enabled', false);
}

function updateTriggerEnabled(trigger: TargetBasedTrigger) {
  updateBitriseYmlDocument(({ doc }) => {
    const [source, sourceId] = trigger.source.split('#') as [TriggerSource, string];
    changeTriggerEnabled(doc, trigger.isActive, {
      source,
      sourceId,
      triggerType: trigger.triggerType,
      index: trigger.index,
    });
    return doc;
  });
}

function addTrigger(trigger: TargetBasedTrigger) {
  updateBitriseYmlDocument(({ doc }) => {
    const [source, sourceId] = trigger.source.split('#') as [TriggerSource, string];
    const entity = getSourceOrThrowError(doc, { source, sourceId });
    entity.flow = false;

    const triggers = YamlUtils.getSeqIn(doc, [source, sourceId, 'triggers', trigger.triggerType], true);
    triggers.add(doc.createNode(toTargetBasedItemModel(trigger)));

    return doc;
  });
}

function updateTriggerPriority(
  doc: Document,
  priority: number | undefined,
  at: { source: TriggerSource; sourceId: string; triggerType: TriggerType; index: number },
) {
  const entity = getTriggerOrThrowError(doc, at);

  if (priority === undefined) {
    entity.delete('priority');
  } else {
    entity.set('priority', priority);
  }
}

function updateTriggerDraftPr(
  doc: Document,
  isDraftPr: boolean | undefined,
  at: { source: TriggerSource; sourceId: string; triggerType: TriggerType; index: number },
) {
  const entity = getTriggerOrThrowError(doc, at);
  entity.flow = false;

  if (isDraftPr === false) {
    entity.set('draft_enabled', false);
  } else {
    entity.delete('draft_enabled');
  }
}

function addTriggerCondition(
  doc: Document,
  condition: TargetBasedCondition,
  at: { source: TriggerSource; sourceId: string; triggerType: TriggerType; index: number },
) {
  const entity = getTriggerOrThrowError(doc, at);
  entity.flow = false;
  entity.set(condition.type, doc.createNode(fromTargetBasedCondition(condition)));
}

function removeTriggerCondition(
  doc: Document,
  conditionType: TargetBasedConditionType,
  at: {
    source: TriggerSource;
    sourceId: string;
    triggerType: TriggerType;
    index: number;
  },
) {
  getTriggerConditionOrThrowError(doc, { ...at, conditionType });
  const trigger = getTriggerOrThrowError(doc, at);
  trigger.delete(conditionType);
}

function updateTriggerConditionRegex(
  doc: Document,
  isRegex: boolean,
  at: { source: TriggerSource; sourceId: string; triggerType: TriggerType; index: number; conditionType: string },
) {
  const trigger = getTriggerOrThrowError(doc, at);
  const condition = getTriggerConditionOrThrowError(doc, at);

  if (isRegex) {
    if (typeof condition === 'string') {
      // set regex from string
      const finalValue = cleanConditionValue(condition, true);
      trigger.set(at.conditionType, doc.createNode({ regex: finalValue }));
      return;
    }
    if (isMap(condition) && condition.has('pattern')) {
      // set regex from pattern
      const finalValue = cleanConditionValue(condition.get('pattern') as string, true);
      YamlUtils.updateMapKey(condition, 'pattern', 'regex');
      condition.set('regex', finalValue);
      return;
    }
    if (isMap(condition) && condition.has('regex')) {
      // already has regex, do nothing
      return;
    }
  }

  // NOT regex
  if (typeof condition === 'string') {
    // does not have regex, do nothing
    return;
  }
  if (isMap(condition) && !condition.has('regex')) {
    // does not have regex, do nothing
    return;
  }
  if (isMap(condition) && condition.has('regex') && condition.has('last_commit')) {
    // set pattern from regex
    const finalValue = cleanConditionValue(condition.get('regex') as string, false);
    YamlUtils.updateMapKey(condition, 'regex', 'pattern');
    condition.set('pattern', finalValue);
    return;
  }
  if (isMap(condition) && condition.has('regex') && !condition.has('last_commit')) {
    // set string from regex
    const finalValue = cleanConditionValue(condition.get('regex') as string, false);
    trigger.set(at.conditionType, finalValue);
  }
}

function updateTriggerConditionLastCommit(
  doc: Document,
  isLastCommit: boolean | undefined,
  at: {
    source: TriggerSource;
    sourceId: string;
    triggerType: TriggerType;
    index: number;
    conditionType: TargetBasedConditionType;
  },
) {
  const trigger = getTriggerOrThrowError(doc, at);
  const condition = getTriggerConditionOrThrowError(doc, at);

  // set last_commit
  if (isLastCommit) {
    // change string to object with last_commit set to true
    if (typeof condition === 'string') {
      trigger.set(at.conditionType, doc.createNode({ pattern: condition, last_commit: true }));
      return;
    }
    // set last_commit to true
    if (isMap(condition)) {
      condition.set('last_commit', true);
      return;
    }
  }

  // NOT last_commit

  // does not have last_commit, do nothing
  if (typeof condition === 'string') {
    return;
  }
  // delete last_commit
  if (isMap(condition)) {
    condition.delete('last_commit');
  }
}

function updateTriggerConditionValue(
  doc: Document,
  value: string,
  at: { source: TriggerSource; sourceId: string; triggerType: TriggerType; index: number; conditionType: string },
) {
  const trigger = getTriggerOrThrowError(doc, at);
  const condition = getTriggerConditionOrThrowError(doc, at);

  let finalValue = value.trim();
  if (finalValue === '') {
    finalValue = isMap(condition) && condition.has('regex') ? '.*' : '*';
  }

  if (isMap(condition) && condition.has('regex')) {
    condition.set('regex', finalValue);
  } else if (isMap(condition) && condition.has('pattern')) {
    condition.set('pattern', finalValue);
  } else {
    trigger.set(at.conditionType, finalValue);
  }
}

function updateConditions(
  doc: Document,
  conditions: TargetBasedCondition[],
  at: { source: TriggerSource; sourceId: string; triggerType: TriggerType; index: number },
) {
  const trigger = getTriggerOrThrowError(doc, at);
  const newConditionTypes = conditions.map((c) => c.type);
  const oldConditionTypes = ALL_TARGET_BASED_CONDITION_TYPES.reduce((acc, c) => {
    if (trigger.has(c)) {
      acc.push(c);
    }
    return acc;
  }, [] as TargetBasedConditionType[]);

  const removedConditionTypes = oldConditionTypes.filter((c) => !newConditionTypes.includes(c));
  const addedConditionTypes = newConditionTypes.filter((c) => !oldConditionTypes.includes(c));
  const updatedConditionTypes = newConditionTypes.filter((c) => oldConditionTypes.includes(c));

  // remove old conditions
  removedConditionTypes.forEach((conditionType) => {
    removeTriggerCondition(doc, conditionType, at);
  });

  // update existing conditions
  updatedConditionTypes.forEach((conditionType) => {
    const condition = conditions.find((c) => c.type === conditionType);
    if (condition) {
      updateTriggerConditionValue(doc, condition.value, { ...at, conditionType });
      updateTriggerConditionRegex(doc, condition.isRegex || false, { ...at, conditionType });
      updateTriggerConditionLastCommit(doc, condition.isLastCommitOnly, { ...at, conditionType });
    }
  });

  // add new conditions
  addedConditionTypes.forEach((conditionType) => {
    const condition = conditions.find((c) => c.type === conditionType);
    if (condition) {
      addTriggerCondition(doc, condition, at);
    }
  });
}

function updateTrigger(trigger: TargetBasedTrigger) {
  updateBitriseYmlDocument(({ doc }) => {
    const [source, sourceId] = trigger.source.split('#') as [TriggerSource, string];
    const triggerItem = getTriggerOrThrowError(doc, {
      source,
      sourceId,
      triggerType: trigger.triggerType,
      index: trigger.index,
    });

    // update the conditions
    updateConditions(doc, trigger.conditions, {
      source,
      sourceId,
      triggerType: trigger.triggerType,
      index: trigger.index,
    });

    if (
      trigger.triggerType === 'pull_request' &&
      (trigger.isDraftPr !== false) !== (triggerItem.get('draft_enabled') !== false)
    ) {
      updateTriggerDraftPr(doc, trigger.isDraftPr, {
        source,
        sourceId,
        triggerType: 'pull_request',
        index: trigger.index,
      });
    }

    if (trigger.priority !== triggerItem.get('priority')) {
      updateTriggerPriority(doc, trigger.priority, {
        source,
        sourceId,
        triggerType: trigger.triggerType,
        index: trigger.index,
      });
    }

    // write out enabled false only
    if (trigger.isActive !== (triggerItem.get('enabled') !== false)) {
      changeTriggerEnabled(doc, trigger.isActive, {
        source,
        sourceId,
        triggerType: trigger.triggerType,
        index: trigger.index,
      });
    }

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
  convertToTargetBasedTrigger,
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
