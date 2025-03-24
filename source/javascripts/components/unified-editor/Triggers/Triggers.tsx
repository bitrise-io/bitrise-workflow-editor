import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  ExpandableCard,
  Icon,
  Link,
  Notification,
  OverflowMenu,
  OverflowMenuItem,
  Text,
  Toggle,
} from '@bitrise/bitkit';
import { isEqual } from 'es-toolkit';

import { segmentTrack } from '@/core/analytics/SegmentBaseTracking';
import { TriggerMapItemModelRegexCondition, TriggersModel } from '@/core/models/BitriseYml';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import useUserMetaData from '@/hooks/useUserMetaData';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import deepCloneSimpleObject from '@/utils/deepCloneSimpleObject';

import { TargetBasedTriggerItem, TriggerType } from './Triggers.types';
import AddTrigger from './components/AddTrigger/AddTrigger';
import TriggerConditions from './components/TriggerConditions';
import { getConditionList, getPipelineableTriggers } from './Triggers.utils';

const OPTIONS_MAP: Record<TriggerType, Record<string, string>> = {
  push: {
    branch: 'Push branch',
    commit_message: 'Commit message',
    changed_files: 'File change',
  },
  pull_request: {
    target_branch: 'Target branch',
    source_branch: 'Source branch',
    label: 'PR label',
    comment: 'PR comment',
    commit_message: 'Commit message',
    changed_files: 'File change',
  },
  tag: {
    name: 'Tag',
  },
};

const LABELS_MAP: Record<TriggerType, Record<string, string>> = {
  push: {
    branch: 'Push branch',
    commit_message: 'Enter a commit message',
    changed_files: 'Enter a path',
  },
  pull_request: {
    target_branch: 'Enter a target branch',
    source_branch: 'Enter a source branch',
    label: 'Enter a label',
    comment: 'Enter a comment',
    commit_message: 'Enter a commit message',
    changed_files: 'Enter a path',
  },
  tag: {
    tag: 'Enter a tag',
  },
};

type TriggerItemProps = {
  globalDisabled: boolean;
  onTriggerToggle: (triggerDisabled: boolean) => void;
  onTriggerEdit: () => void;
  onDeleteClick: () => void;
  trigger: TargetBasedTriggerItem;
  triggerType: TriggerType;
};

const TriggerItem = (props: TriggerItemProps) => {
  const { globalDisabled, onDeleteClick, onTriggerToggle, onTriggerEdit, trigger, triggerType } = props;
  const conditions = getConditionList(trigger);
  const triggerDisabled = trigger.enabled === false;
  return (
    <Box
      padding="16px 20px 16px 24px"
      borderBlockEnd="1px solid"
      borderBlockEndColor="border/minimal"
      display="flex"
      gap="16"
      justifyContent="space-between"
    >
      <TriggerConditions
        conditions={conditions}
        isDraftPr={trigger.draft_enabled}
        triggerType={triggerType}
        priority={trigger.priority}
        triggerDisabled={globalDisabled || triggerDisabled}
      />
      <OverflowMenu>
        <OverflowMenuItem leftIconName="Pencil" onClick={onTriggerEdit}>
          Edit trigger
        </OverflowMenuItem>
        <OverflowMenuItem
          leftIconName={triggerDisabled ? 'Play' : 'BlockCircle'}
          onClick={() => {
            onTriggerToggle(triggerDisabled);
          }}
        >
          {triggerDisabled ? 'Enable trigger' : 'Disable trigger'}
        </OverflowMenuItem>
        <OverflowMenuItem isDanger leftIconName="Trash" onClick={onDeleteClick}>
          Delete trigger
        </OverflowMenuItem>
      </OverflowMenu>
    </Box>
  );
};

type TriggersProps = {
  additionalTrackingData: Record<string, string>;
  id: string;
  triggers?: TriggersModel;
  updateTriggers: (workflowId: string, triggers: TriggersModel) => void;
  updateTriggersEnabled: (workflowId: string, isEnabled: boolean) => void;
  entity: 'Workflow' | 'Pipeline';
};

const Triggers = (props: TriggersProps) => {
  const { additionalTrackingData, id, triggers: triggersProp, entity, updateTriggers, updateTriggersEnabled } = props;

  const [triggerType, setTriggerType] = useState<TriggerType | undefined>(undefined);
  const [editedItem, setEditedItem] = useState<{ index: number; trigger: TargetBasedTriggerItem } | undefined>(
    undefined,
  );
  const isWebsiteMode = RuntimeUtils.isWebsiteMode();

  const { value: metaDataValue, update: updateMetaData } = useUserMetaData(
    'wfe_target_based_triggering_notification_closed',
    isWebsiteMode,
  );

  const triggers: TriggersModel = deepCloneSimpleObject(triggersProp || {});

  const { triggersInProject, numberOfLegacyTriggers } = useBitriseYmlStore(({ yml }) => ({
    triggersInProject: getPipelineableTriggers(yml),
    numberOfLegacyTriggers: yml.trigger_map?.length || 0,
  }));

  const trackingData = {
    number_of_existing_target_based_triggers_on_target: triggersInProject.filter(
      ({ pipelineableId }) => pipelineableId === id,
    ).length,
    number_of_existing_target_based_triggers_in_project: triggersInProject.length,
    number_of_existing_trigger_map_triggers_in_project: numberOfLegacyTriggers,
    is_target_based_triggers_enabled_on_target: triggers.enabled !== false,
    ...additionalTrackingData,
  };

  const onTriggerDelete = (trigger: TargetBasedTriggerItem, type: TriggerType) => {
    triggers[type] = triggers[type]?.filter((t: TargetBasedTriggerItem) => !isEqual(trigger, t));
    updateTriggers(id, triggers);
  };

  const onTriggerToggle = (
    type: TriggerType,
    index: number,
    triggerDisabled: boolean,
    trigger: TargetBasedTriggerItem,
  ) => {
    if (!triggerDisabled) {
      if (triggers[type]?.[index]) {
        (triggers[type][index] as TargetBasedTriggerItem).enabled = false;
      }
    } else if (triggers[type]?.[index]) {
      delete (triggers[type][index] as TargetBasedTriggerItem).enabled;
    }

    const triggerConditions: Record<string, TriggerMapItemModelRegexCondition> = {};
    (Object.keys(trigger) as (keyof typeof trigger)[]).forEach((key) => {
      if (key !== 'enabled' && key !== 'draft_enabled' && key !== 'priority') {
        if (typeof trigger[key] === 'string') {
          triggerConditions[key] = {
            regex: trigger[key],
          } as TriggerMapItemModelRegexCondition;
        } else {
          triggerConditions[key] = trigger[key] as TriggerMapItemModelRegexCondition;
        }
      }
    });

    segmentTrack('Workflow Editor Enable Trigger Toggled', {
      ...trackingData,
      is_selected_trigger_enabled: !triggerDisabled,
      trigger_origin: 'workflow_triggers',
      trigger_conditions: triggerConditions,
      build_trigger_type: type,
    });
    updateTriggers(id, triggers);
  };

  const onSubmit = (trigger: TargetBasedTriggerItem) => {
    if (triggerType !== undefined) {
      if (!Array.isArray(triggers[triggerType])) {
        triggers[triggerType] = [];
      }
      if (editedItem) {
        triggers[triggerType][editedItem.index] = trigger;
      } else {
        triggers[triggerType].push(trigger);
      }

      updateTriggers(id, triggers);
    }
    setTriggerType(undefined);
    setEditedItem(undefined);
  };

  const onToggleChange = () => {
    segmentTrack('Workflow Editor Enable Target Based Triggers Toggled', {
      ...trackingData,
      is_target_based_triggers_enabled_on_target: triggers.enabled !== false,
      number_of_enabled_existing_target_based_triggers_in_project: triggersInProject.filter(
        ({ enabled }) => enabled !== false,
      ).length,
    });
    updateTriggersEnabled(id, triggers.enabled === false);
  };

  return (
    <>
      {triggerType !== undefined && (
        <AddTrigger
          id={id}
          onSubmit={onSubmit}
          triggerType={triggerType}
          onCancel={() => {
            setTriggerType(undefined);
            setEditedItem(undefined);
          }}
          optionsMap={OPTIONS_MAP[triggerType]}
          labelsMap={LABELS_MAP[triggerType]}
          editedItem={editedItem?.trigger}
          currentTriggers={(triggers[triggerType] as TargetBasedTriggerItem[]) || []}
          trackingData={trackingData}
          entity={entity}
        />
      )}
      <Box display={triggerType !== undefined ? 'none' : 'block'}>
        {metaDataValue === null && (
          <Notification status="info" onClose={() => updateMetaData('true')} marginBlockEnd="24">
            <Text textStyle="heading/h4">Triggers</Text>
            <Text>
              Set up triggers directly in your Workflows or Pipelines. This way a single Git event can trigger multiple
              targets.{' '}
              <Link
                href="https://devcenter.bitrise.io/en/builds/starting-builds/triggering-builds-automatically.html"
                isUnderlined
              >
                Learn more
              </Link>
            </Text>
          </Notification>
        )}
        <Card paddingY="16" paddingX="24" marginBlockEnd="24" variant="outline">
          <Toggle
            variant="fixed"
            label="Enable triggers"
            helperText="When disabled and saved, none of the triggers below will execute a build."
            isChecked={triggers.enabled !== false}
            onChange={() => {
              onToggleChange();
            }}
          />
        </Card>
        <ExpandableCard
          isExpanded
          padding="0"
          buttonPadding="16px 24px"
          buttonContent={
            <Box display="flex" justifyContent="flex-start">
              <Icon name="Push" marginRight={8} />
              <Text textStyle="body/lg/semibold">Push</Text>
            </Box>
          }
        >
          {(triggers.push as TargetBasedTriggerItem[])?.map((trigger: TargetBasedTriggerItem, index: number) => (
            <TriggerItem
              key={JSON.stringify(trigger)}
              onDeleteClick={() => onTriggerDelete(trigger, 'push')}
              trigger={trigger}
              triggerType="push"
              onTriggerEdit={() => {
                setEditedItem({ trigger, index });
                setTriggerType('push');
              }}
              onTriggerToggle={(triggerDisabled) => {
                onTriggerToggle('push', index, triggerDisabled, trigger);
              }}
              globalDisabled={triggers.enabled === false}
            />
          ))}
          <Button
            margin="12"
            size="md"
            variant="tertiary"
            leftIconName="Plus"
            onClick={() => {
              setTriggerType('push');
            }}
          >
            Add trigger
          </Button>
        </ExpandableCard>
        <ExpandableCard
          isExpanded
          padding="0"
          buttonPadding="16px 24px"
          buttonContent={
            <Box display="flex" justifyContent="flex-start">
              <Icon name="Pull" marginRight={8} />
              <Text textStyle="body/lg/semibold">Pull request</Text>
            </Box>
          }
          marginY="12"
        >
          {(triggers.pull_request as TargetBasedTriggerItem[])?.map(
            (trigger: TargetBasedTriggerItem, index: number) => (
              <TriggerItem
                key={JSON.stringify(trigger)}
                triggerType="pull_request"
                onDeleteClick={() => onTriggerDelete(trigger, 'pull_request')}
                onTriggerEdit={() => {
                  setEditedItem({ trigger, index });
                  setTriggerType('pull_request');
                }}
                trigger={trigger}
                onTriggerToggle={(triggerDisabled) => {
                  onTriggerToggle('pull_request', index, triggerDisabled, trigger);
                }}
                globalDisabled={triggers.enabled === false}
              />
            ),
          )}
          <Button
            margin="12"
            size="md"
            variant="tertiary"
            leftIconName="Plus"
            onClick={() => {
              setTriggerType('pull_request');
            }}
          >
            Add trigger
          </Button>
        </ExpandableCard>
        <ExpandableCard
          isExpanded
          padding="0"
          buttonPadding="16px 24px"
          buttonContent={
            <Box display="flex" justifyContent="flex-start">
              <Icon name="Tag" marginRight={8} />
              <Text textStyle="body/lg/semibold">Tag</Text>
            </Box>
          }
        >
          {(triggers.tag as TargetBasedTriggerItem[])?.map((trigger: TargetBasedTriggerItem, index: number) => (
            <TriggerItem
              key={JSON.stringify(trigger)}
              onDeleteClick={() => onTriggerDelete(trigger, 'tag')}
              triggerType="tag"
              trigger={trigger}
              onTriggerEdit={() => {
                setEditedItem({ trigger, index });
                setTriggerType('tag');
              }}
              onTriggerToggle={(triggerDisabled) => {
                onTriggerToggle('tag', index, triggerDisabled, trigger);
              }}
              globalDisabled={triggers.enabled === false}
            />
          ))}
          <Button
            margin="12"
            size="md"
            variant="tertiary"
            leftIconName="Plus"
            onClick={() => {
              setTriggerType('tag');
            }}
          >
            Add trigger
          </Button>
        </ExpandableCard>
      </Box>
    </>
  );
};

export default Triggers;
