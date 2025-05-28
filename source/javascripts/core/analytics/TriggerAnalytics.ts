import { TargetBasedTrigger, TriggerSource } from '@/core/models/Trigger';

import { TriggerMapItemModelRegexCondition } from '../models/BitriseYml';
import { LegacyTrigger } from '../models/Trigger.legacy';
import { getBitriseYml } from '../stores/BitriseYmlStore';
import { segmentTrack } from './SegmentBaseTracking';

function getTriggerConditions(trigger: LegacyTrigger | TargetBasedTrigger) {
  return trigger.conditions.reduce(
    (acc, condition) => {
      const { type, isRegex, value } = condition;
      acc[type] = isRegex ? { regex: value } : value;
      return acc;
    },
    {} as Record<string, TriggerMapItemModelRegexCondition>,
  );
}

function getTrackingData(source: TriggerSource, sourceId: string) {
  const propName = source === 'workflows' ? 'workflow_name' : 'pipeline_name';

  const yml = getBitriseYml();
  const numberOfLegacyTriggers = yml.trigger_map?.length || 0;
  const pipelines = yml.pipelines || {};
  const workflows = yml.workflows || {};

  const numberOfTargetBasedTriggers =
    Object.values(pipelines).reduce(
      (acc, pipeline) =>
        acc +
        (pipeline?.triggers?.push?.length || 0) +
        (pipeline?.triggers?.pull_request?.length || 0) +
        (pipeline?.triggers?.tag?.length || 0),
      0,
    ) +
    Object.values(workflows).reduce(
      (acc, workflow) =>
        acc +
        (workflow?.triggers?.push?.length || 0) +
        (workflow?.triggers?.pull_request?.length || 0) +
        (workflow?.triggers?.tag?.length || 0),
      0,
    );

  const target = yml[source]?.[sourceId] || {};
  const isTriggersEnabledOnTarget = target.triggers?.enabled !== false;
  const numberOfTriggersOnTarget =
    (target.triggers?.push?.length || 0) +
    (target.triggers?.pull_request?.length || 0) +
    (target.triggers?.tag?.length || 0);

  return {
    tab_name: source,
    [propName]: sourceId,
    number_of_existing_target_based_triggers_on_target: numberOfTriggersOnTarget,
    number_of_existing_target_based_triggers_in_project: numberOfTargetBasedTriggers,
    number_of_existing_trigger_map_triggers_in_project: numberOfLegacyTriggers,
    is_target_based_triggers_enabled_on_target: isTriggersEnabledOnTarget,
  };
}

function trackTriggerEnabledToggled(
  trigger: LegacyTrigger | TargetBasedTrigger,
  trigger_origin: 'trigger_map' | 'pipeline_triggers' | 'workflow_triggers',
) {
  const [source, sourceId] = trigger.source.split('#') as [TriggerSource, string];
  const trackingData = {
    ...getTrackingData(source, sourceId),
    build_trigger_type: trigger.triggerType,
    is_selected_trigger_enabled: trigger.isActive,
    trigger_origin,
    trigger_conditions: getTriggerConditions(trigger),
  };

  segmentTrack('Workflow Editor Enable Trigger Toggled', trackingData);
}

function trackTargetBasedTriggersEnabledToggled(source: TriggerSource, sourceId: string, isEnabled: boolean) {
  const yml = getBitriseYml();
  const pipelines = yml.pipelines || {};
  const workflows = yml.workflows || {};

  const numberOfEnabledTargetBasedTriggers =
    Object.values(pipelines).reduce(
      (acc, pipeline) =>
        acc +
        (pipeline?.triggers?.push?.filter((t) => t.enabled !== false).length || 0) +
        (pipeline?.triggers?.pull_request?.filter((t) => t.enabled !== false).length || 0) +
        (pipeline?.triggers?.tag?.filter((t) => t.enabled !== false).length || 0),
      0,
    ) +
    Object.values(workflows).reduce(
      (acc, workflow) =>
        acc +
        (workflow?.triggers?.push?.filter((t) => t.enabled !== false).length || 0) +
        (workflow?.triggers?.pull_request?.filter((t) => t.enabled !== false).length || 0) +
        (workflow?.triggers?.tag?.filter((t) => t.enabled !== false).length || 0),
      0,
    );

  const trackingData = {
    ...getTrackingData(source, sourceId),
    is_target_based_triggers_enabled_on_target: isEnabled,
    number_of_enabled_existing_target_based_triggers_in_project: numberOfEnabledTargetBasedTriggers,
  };

  segmentTrack('Workflow Editor Enable Target Based Triggers Toggled', trackingData);
}

function trackAddTrigger(trigger: LegacyTrigger | TargetBasedTrigger) {
  const [source, sourceId] = trigger.source.split('#') as [TriggerSource, string];
  const trackingData = {
    ...getTrackingData(source, sourceId),
    build_trigger_type: trigger.triggerType,
    trigger_conditions: getTriggerConditions(trigger),
    trigger_origin: source === 'pipelines' ? 'pipeline_triggers' : 'workflow_triggers',
  };

  segmentTrack('Workflow Editor Add Trigger Button Clicked', trackingData);
}

function trackEditTrigger(trigger: LegacyTrigger | TargetBasedTrigger) {
  const [source, sourceId] = trigger.source.split('#') as [TriggerSource, string];
  const trackingData = {
    ...getTrackingData(source, sourceId),
    build_trigger_type: trigger.triggerType,
    trigger_conditions: getTriggerConditions(trigger),
    trigger_origin: source === 'pipelines' ? 'pipeline_triggers' : 'workflow_triggers',
  };

  segmentTrack('Workflow Editor Apply Trigger Changes Button Clicked', trackingData);
}

export { trackAddTrigger, trackEditTrigger, trackTargetBasedTriggersEnabledToggled, trackTriggerEnabledToggled };
