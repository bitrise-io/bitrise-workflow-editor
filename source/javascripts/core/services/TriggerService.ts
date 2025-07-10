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
import YmlUtils from '../utils/YmlUtils';

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
  const triggerMap = YmlUtils.getSeqIn(doc, ['trigger_map']);
  if (!triggerMap || !isSeq(triggerMap)) {
    throw new Error('trigger_map not found');
  }

  return triggerMap;
}

function getTriggerMapItemOrThrowError(doc: Document, index: number) {
  const triggerMap = getTriggerMapOrThrowError(doc);

  const trigger = YmlUtils.getMapIn(triggerMap, [index]);
  if (!trigger) {
    throw new Error(`Trigger is not found at path trigger_map.${index}`);
  }

  return trigger;
}

function getTriggerMapItemConditionOrThrowError(doc: Document, index: number, conditionType: string) {
  const trigger = getTriggerMapItemOrThrowError(doc, index);
  const condition = trigger.get(conditionType) as Pair<LegacyConditionType, TriggerMapItemModelRegexCondition>;

  if (!condition) {
    throw new Error(`Condition ${conditionType} not found at path trigger_map.${index}`);
  }

  return condition;
}

function addLegacyTrigger(trigger: LegacyTrigger) {
  updateBitriseYmlDocument(({ doc }) => {
    YmlUtils.addIn(doc, ['trigger_map'], toTriggerMapItemModel(trigger));
    return doc;
  });
}

function removeLegacyTrigger(index: number) {
  updateBitriseYmlDocument(({ doc }) => {
    getTriggerMapItemOrThrowError(doc, index);
    YmlUtils.deleteByPath(doc, ['trigger_map', index]);
    return doc;
  });
}

function changeLegacyTriggerEnabled(doc: Document, enabled: boolean, index: number) {
  const trigger = getTriggerMapItemOrThrowError(doc, index);

  if (enabled) {
    YmlUtils.deleteByPath(trigger, ['enabled']);
    return;
  }

  YmlUtils.unflowEmptyCollection(trigger);
  YmlUtils.setIn(trigger, ['enabled'], false);
}

function updateLegacyTriggerEnabled(trigger: LegacyTrigger) {
  updateBitriseYmlDocument(({ doc }) => {
    changeLegacyTriggerEnabled(doc, trigger.isActive, trigger.index);
    return doc;
  });
}

function updateLegacyTriggerDraftPr(doc: Document, isDraftPr: boolean | undefined, index: number) {
  const trigger = getTriggerMapItemOrThrowError(doc, index);
  YmlUtils.unflowEmptyCollection(trigger);

  if (isDraftPr === false) {
    YmlUtils.setIn(trigger, ['draft_pull_request_enabled'], false);
  } else {
    YmlUtils.deleteByPath(trigger, ['draft_pull_request_enabled']);
  }
}

function updateLegacyTriggerSource(doc: Document, legacyTrigger: LegacyTrigger) {
  const trigger = getTriggerMapItemOrThrowError(doc, legacyTrigger.index);
  const [target, targetId] = legacyTrigger.source.split('#') as [TriggerSource, string];

  if (target === 'pipelines') {
    YmlUtils.setIn(trigger, ['pipeline'], targetId);
    YmlUtils.deleteByPath(trigger, ['workflow']);
  } else if (target === 'workflows') {
    YmlUtils.setIn(trigger, ['workflow'], targetId);
    YmlUtils.deleteByPath(trigger, ['pipeline']);
  }
}

function addLegacyTriggerCondition(doc: Document, condition: LegacyCondition, index: number) {
  const trigger = getTriggerMapItemOrThrowError(doc, index);
  YmlUtils.unflowEmptyCollection(trigger);
  YmlUtils.setIn(trigger, [condition.type], fromLegacyCondition(condition));
}

function removeLegacyTriggerCondition(doc: Document, conditionType: LegacyConditionType, index: number) {
  getTriggerMapItemConditionOrThrowError(doc, index, conditionType);
  const trigger = getTriggerMapItemOrThrowError(doc, index);
  YmlUtils.deleteByPath(trigger, [conditionType]);
}

function updateLegacyTriggerConditionRegex(
  doc: Document,
  isRegex: boolean,
  index: number,
  conditionType: LegacyConditionType,
) {
  const trigger = getTriggerMapItemOrThrowError(doc, index);
  const condition = trigger.get(conditionType) as Pair<LegacyConditionType, TriggerMapItemModelRegexCondition>;

  if (isRegex) {
    if (typeof condition === 'string') {
      // set regex from string
      const finalValue = cleanConditionValue(condition, true);
      YmlUtils.setIn(trigger, [conditionType], { regex: finalValue });
      return;
    }
    if (isMap(condition) && condition.has('pattern')) {
      // set regex from pattern
      const finalValue = cleanConditionValue(condition.get('pattern') as string, true);
      YmlUtils.updateKeyByPath(condition, ['pattern'], 'regex');
      YmlUtils.setIn(condition, ['regex'], finalValue);
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
    YmlUtils.updateKeyByPath(condition, ['regex'], 'pattern');
    YmlUtils.setIn(condition, ['pattern'], finalValue);
    return;
  }
  if (isMap(condition) && condition.has('regex') && !condition.has('last_commit')) {
    // set string from regex
    const finalValue = cleanConditionValue(condition.get('regex') as string, false);
    YmlUtils.setIn(trigger, [conditionType], finalValue);
  }
}

function updateLegacyTriggerConditionValue(
  doc: Document,
  value: string,
  index: number,
  conditionType: LegacyConditionType,
) {
  const trigger = getTriggerMapItemOrThrowError(doc, index);
  const condition = trigger.get(conditionType);

  let finalValue = value.trim();
  if (finalValue === '') {
    finalValue = isMap(condition) && condition.has('regex') ? '.*' : '*';
  }

  if (isMap(condition) && condition.has('regex')) {
    YmlUtils.setIn(condition, ['regex'], finalValue);
  } else if (isMap(condition) && condition.has('pattern')) {
    YmlUtils.setIn(condition, ['pattern'], finalValue);
  } else {
    YmlUtils.setIn(trigger, [conditionType], finalValue);
  }
}

function updateLegacyConditions(doc: Document, conditions: LegacyCondition[], index: number) {
  const trigger = getTriggerMapItemOrThrowError(doc, index);
  const newConditionTypes = conditions.map((c) => c.type);
  const oldConditionTypes = ALL_LEGACY_CONDITION_TYPES.reduce((acc, c) => {
    if (trigger.has(c)) {
      acc.push(c);
    }
    return acc;
  }, [] as LegacyConditionType[]);

  const removedConditionTypes = oldConditionTypes.filter((c) => !newConditionTypes.includes(c));
  const addedConditionTypes = newConditionTypes.filter((c) => !oldConditionTypes.includes(c));
  const updatedConditionTypes = newConditionTypes.filter((c) => oldConditionTypes.includes(c));

  // remove old conditions
  removedConditionTypes.forEach((conditionType) => {
    removeLegacyTriggerCondition(doc, conditionType, index);
  });

  // update existing conditions
  updatedConditionTypes.forEach((conditionType) => {
    const condition = conditions.find((c) => c.type === conditionType);
    if (condition) {
      updateLegacyTriggerConditionValue(doc, condition.value, index, conditionType);
      updateLegacyTriggerConditionRegex(doc, condition.isRegex || false, index, conditionType);
    }
  });

  // add new conditions
  addedConditionTypes.forEach((conditionType) => {
    const condition = conditions.find((c) => c.type === conditionType);
    if (condition) {
      addLegacyTriggerCondition(doc, condition, index);
    }
  });
}

function updateLegacyTrigger(trigger: LegacyTrigger) {
  updateBitriseYmlDocument(({ doc }) => {
    const triggerItem = getTriggerMapItemOrThrowError(doc, trigger.index);

    // Update the conditions
    updateLegacyConditions(doc, trigger.conditions, trigger.index);

    // update the draft_pr_enabled property
    if (
      trigger.triggerType === 'pull_request' &&
      (trigger.isDraftPr !== false) !== (triggerItem.get('draft_pull_request_enabled') !== false)
    ) {
      updateLegacyTriggerDraftPr(doc, trigger.isDraftPr, trigger.index);
    }

    updateLegacyTriggerSource(doc, trigger);

    // Update the enabled property
    if (trigger.isActive !== (triggerItem.get('enabled') !== false)) {
      changeLegacyTriggerEnabled(doc, trigger.isActive, trigger.index);
    }

    return doc;
  });
}

function updateTriggerMap(triggers?: Record<TriggerType, LegacyTrigger[]>) {
  updateBitriseYmlDocument(({ doc }) => {
    if (!triggers) {
      doc.delete('trigger_map');
      return doc;
    }

    YmlUtils.setIn(doc, ['trigger_map'], toTriggerMap(triggers));

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
        isTriggersModelActive: triggersModel?.enabled !== false,
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
  const entity = YmlUtils.getMapIn(doc, [source, sourceId]);

  if (!entity) {
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
  const trigger = YmlUtils.getMapIn(entity, ['triggers', triggerType, index]);

  if (!trigger) {
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
    const entity = getSourceOrThrowError(doc, at);

    if (enabled) {
      YmlUtils.deleteByPath(entity, ['triggers', 'enabled']);
      return doc;
    }

    const triggers = YmlUtils.getMapIn(entity, ['triggers'], true);
    YmlUtils.setIn(triggers, ['enabled'], false);

    return doc;
  });
}

function addTrigger(trigger: TargetBasedTrigger) {
  updateBitriseYmlDocument(({ doc }) => {
    const [source, sourceId] = trigger.source.split('#') as [TriggerSource, string];
    const entity = getSourceOrThrowError(doc, { source, sourceId });

    YmlUtils.addIn(entity, ['triggers', trigger.triggerType], toTargetBasedItemModel(trigger));

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
    YmlUtils.deleteByPath(trigger, ['enabled']);
    return;
  }

  YmlUtils.setIn(trigger, ['enabled'], false);
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

function updateTriggerPriority(
  doc: Document,
  priority: number | undefined,
  at: { source: TriggerSource; sourceId: string; triggerType: TriggerType; index: number },
) {
  const entity = getTriggerOrThrowError(doc, at);

  if (priority === undefined) {
    YmlUtils.deleteByPath(entity, ['priority']);
  } else {
    YmlUtils.setIn(entity, ['priority'], priority);
  }
}

function updateTriggerDraftPr(
  doc: Document,
  isDraftPr: boolean | undefined,
  at: { source: TriggerSource; sourceId: string; triggerType: TriggerType; index: number },
) {
  const entity = getTriggerOrThrowError(doc, at);

  if (isDraftPr === false) {
    YmlUtils.setIn(entity, ['draft_enabled'], false);
  } else {
    YmlUtils.deleteByPath(entity, ['draft_enabled']);
  }
}

function addTriggerCondition(
  doc: Document,
  condition: TargetBasedCondition,
  at: { source: TriggerSource; sourceId: string; triggerType: TriggerType; index: number },
) {
  const entity = getTriggerOrThrowError(doc, at);
  YmlUtils.setIn(entity, [condition.type], fromTargetBasedCondition(condition));
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
      YmlUtils.setIn(trigger, [at.conditionType], { regex: finalValue });
      return;
    }
    if (isMap(condition) && condition.has('pattern')) {
      // set regex from pattern
      const finalValue = cleanConditionValue(condition.get('pattern') as string, true);
      YmlUtils.updateKeyByPath(condition, ['pattern'], 'regex');
      YmlUtils.setIn(condition, ['regex'], finalValue);
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
    YmlUtils.updateKeyByPath(condition, ['regex'], 'pattern');
    YmlUtils.setIn(condition, ['pattern'], finalValue);
    return;
  }
  if (isMap(condition) && condition.has('regex') && !condition.has('last_commit')) {
    // set string from regex
    const finalValue = cleanConditionValue(condition.get('regex') as string, false);
    YmlUtils.setIn(trigger, [at.conditionType], finalValue);
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
      YmlUtils.setIn(trigger, [at.conditionType], { pattern: condition, last_commit: true });
      return;
    }
    // set last_commit to true
    if (isMap(condition)) {
      YmlUtils.setIn(condition, ['last_commit'], true);
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
    YmlUtils.setIn(condition, ['regex'], finalValue);
  } else if (isMap(condition) && condition.has('pattern')) {
    YmlUtils.setIn(condition, ['pattern'], finalValue);
  } else {
    YmlUtils.setIn(trigger, [at.conditionType], finalValue);
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

function removeTrigger(trigger: TargetBasedTrigger) {
  updateBitriseYmlDocument(({ doc }) => {
    const [source, sourceId] = trigger.source.split('#') as [TriggerSource, string];
    const sourceNode = getSourceOrThrowError(doc, { source, sourceId });
    getTriggerOrThrowError(doc, { source, sourceId, triggerType: trigger.triggerType, index: trigger.index });

    YmlUtils.deleteByPath(sourceNode, ['triggers', trigger.triggerType, trigger.index]);

    return doc;
  });
}

function updateTrigger(trigger: TargetBasedTrigger, editedTrigger?: TargetBasedTrigger) {
  if (editedTrigger && editedTrigger.source !== trigger.source) {
    removeTrigger(editedTrigger);
    addTrigger(trigger);
  }

  updateBitriseYmlDocument(({ doc }) => {
    const [source, sourceId] = trigger.source.split('#') as [TriggerSource, string];
    const triggerItem = getTriggerOrThrowError(doc, {
      source,
      sourceId,
      triggerType: trigger.triggerType,
      index: trigger.index,
    });

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

const REQUIRED_FIELDS = [
  'commit_message',
  'changed_files',
  'label',
  'comment',
  'pull_request_label',
  'pull_request_comment',
];

function requiredField(type: TargetBasedConditionType | LegacyConditionType) {
  return REQUIRED_FIELDS.includes(type);
}

function checkExistingTrigger(
  newTrigger: TargetBasedTrigger | LegacyTrigger,
  currentTriggers: (TargetBasedTrigger | LegacyTrigger)[],
  editedItem?: TargetBasedTrigger | LegacyTrigger,
): boolean {
  let isSameTriggerExist = false;
  currentTriggers.forEach((trigger) => {
    // When draft PR is included it isn't appears in the yml so it's default value is undefined.
    // When draft PR is excluded draft_enabled field appears with false value.
    const isPullRequest = trigger.triggerType === 'pull_request';
    const currentIsDraftPr = trigger.isDraftPr === undefined ? true : trigger.isDraftPr;
    if (
      trigger.uniqueId !== editedItem?.uniqueId &&
      isEqual(trigger.conditions, newTrigger.conditions) &&
      isEqual(trigger.priority, newTrigger.priority) &&
      isEqual(trigger.source, newTrigger.source) &&
      (!isPullRequest || isEqual(currentIsDraftPr, newTrigger.isDraftPr))
    ) {
      isSameTriggerExist = true;
    }
  });

  return isSameTriggerExist;
}

export default {
  // legacy trigger helpers
  toLegacyTriggers,
  isLegacyConditionUsed,
  convertToTargetBasedTrigger,
  toTargetBasedTriggers,
  // legacy trigger actions
  addLegacyTrigger,
  updateLegacyTrigger,
  updateLegacyTriggerEnabled,
  removeLegacyTrigger,
  updateTriggerMap,
  // target-based trigger actions
  updateEnabled,
  addTrigger,
  updateTrigger,
  updateTriggerEnabled,
  removeTrigger,
  // both legacy and target-based trigger helpers
  requiredField,
  checkExistingTrigger,
};
