import { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  ExpandableCard,
  Link,
  Notification,
  OverflowMenu,
  OverflowMenuItem,
  Text,
} from '@bitrise/bitkit';
import { useShallow } from 'zustand/react/shallow';
import { isEqual } from 'lodash';
import { WorkflowYmlObject } from '@/core/models/Workflow';
import { useUserMetaData } from '@/hooks/useUserMetaData';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { useWorkflowConfigContext } from '@/components/unified-editor/WorkflowConfig/WorkflowConfig.context';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import deepCloneSimpleObject from '@/utils/deepCloneSimpleObject';
import { TriggerType } from '../../../../TriggersPage/components/TriggersPage/TriggersPage.types';
import TriggerConditions from '../../../../TriggersPage/components/SelectiveTriggers/TriggerConditions';
import {
  DecoratedPipelineableTriggerItem,
  getConditionList,
} from '../../../../TriggersPage/components/TriggersPage/TriggersPage.utils';
import AddTrigger from '../../../../TriggersPage/components/SelectiveTriggers/AddTrigger';

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
    tag: 'Tag',
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
  onTriggerEdit: () => void;
  onDeleteClick: () => void;
  trigger: DecoratedPipelineableTriggerItem;
};

const TriggerItem = (props: TriggerItemProps) => {
  const { onDeleteClick, onTriggerEdit, trigger } = props;
  return (
    <Box
      padding="24"
      borderBlockEnd="1px solid"
      borderBlockEndColor="border/minimal"
      display="flex"
      gap="16"
      justifyContent="space-between"
    >
      <TriggerConditions
        conditions={getConditionList(trigger)}
        isDraftPr={trigger.type === 'pull_request' && trigger.draft_enabled}
      />
      <OverflowMenu>
        <OverflowMenuItem leftIconName="Pencil" onClick={onTriggerEdit}>
          Edit trigger
        </OverflowMenuItem>
        <OverflowMenuItem isDanger leftIconName="Trash" onClick={onDeleteClick}>
          Delete trigger
        </OverflowMenuItem>
      </OverflowMenu>
    </Box>
  );
};

const TriggersTabPanel = () => {
  const [triggerType, setTriggerType] = useState<TriggerType | undefined>(undefined);
  const [isEditMode, setIsEditMode] = useState(false);
  const isWebsiteMode = RuntimeUtils.isWebsiteMode();

  const { isVisible: isNotificationVisible, close: closeNotification } = useUserMetaData({
    key: 'wfe_selective_triggering_notification_closed',
    enabled: isWebsiteMode,
  });

  const workflow = useWorkflowConfigContext();

  const { updateWorkflowTriggers } = useBitriseYmlStore(
    useShallow((s) => ({
      updateWorkflowTriggers: s.updateWorkflowTriggers,
    })),
  );

  const triggers: WorkflowYmlObject['triggers'] = deepCloneSimpleObject(workflow?.userValues.triggers || {});

  const onTriggerDelete = (trigger: any, type: TriggerType) => {
    triggers[type] = triggers[type]?.filter((t: any) => !isEqual(trigger, t));
    updateWorkflowTriggers(workflow?.id || '', triggers);
  };

  const onTriggerEdit = () => {
    setIsEditMode(true);
  };

  const exampleTriggers = {
    push: [
      {
        branch: 'main',
        enabled: false,
      },
    ],
    tag: [
      {
        name: {
          regex: '^\\d\\.\\d\\.\\d$',
        },
      },
    ],
    pull_request: [
      {
        comment: '[workflow: deploy]',
      },
      {
        commit_message: {
          regex: '.*\\[workflow: deploy\\].*',
        },
      },
    ],
  };

  let enabledTriggers = true;
  Object.entries(exampleTriggers).forEach((type) => {
    type.forEach((obj: any) => {
      if (obj.enabled === 'false') {
        enabledTriggers = false;
      }
    });
  });
  const [triggersActive, setTriggersActive] = useState(enabledTriggers);

  const onSubmit = (trigger: any) => {
    if (triggerType !== undefined) {
      if (!Array.isArray(triggers[triggerType])) {
        triggers[triggerType] = [];
      }
      triggers[triggerType].push(trigger);
      updateWorkflowTriggers(workflow?.id || '', triggers);
    }
    setTriggerType(undefined);
  };

  const areTriggersEnabled = true;

  return (
    <>
      {(triggerType !== undefined || (isEditMode && triggerType !== undefined)) && (
        <AddTrigger
          workflowId={workflow?.id}
          onSubmit={onSubmit}
          triggerType={triggerType}
          onCancel={() => {
            setTriggerType(undefined);
          }}
          optionsMap={OPTIONS_MAP[triggerType]}
          labelsMap={LABELS_MAP[triggerType]}
          areTriggersEnabled={areTriggersEnabled}
          isEditMode={isEditMode}
        />
      )}
      <Box padding="24" display={triggerType !== undefined ? 'none' : 'block'}>
        {isNotificationVisible && (
          <Notification status="info" onClose={closeNotification} marginBlockEnd="24">
            <Text textStyle="heading/h4">Workflow based triggers</Text>
            <Text>
              Set up triggers directly in your Workflows or Pipelines. This way a single Git event can trigger multiple
              Workflows or Pipelines.{' '}
              <Link href="https://devcenter.bitrise.io/" isUnderlined>
                Learn more
              </Link>
            </Text>
          </Notification>
        )}
        <Checkbox
          helperText="When unchecked and saved, none of the triggers below will execute a build."
          isChecked={triggersActive}
          onChange={() => {
            setTriggersActive((prevState) => !prevState);
          }}
          marginBlockEnd="24"
        >
          Active
        </Checkbox>
        <ExpandableCard padding="0" buttonContent={<Text textStyle="body/lg/semibold">Push triggers</Text>}>
          {triggers.push?.map((trigger: any) => (
            <TriggerItem
              key={trigger}
              onDeleteClick={() => onTriggerDelete(trigger, 'push')}
              trigger={trigger}
              onTriggerEdit={onTriggerEdit}
            />
          ))}
          <Button
            margin="24"
            size="md"
            variant="secondary"
            leftIconName="PlusAdd"
            onClick={() => {
              setTriggerType('push');
            }}
          >
            Add push trigger
          </Button>
        </ExpandableCard>
        <ExpandableCard
          padding="0"
          buttonContent={<Text textStyle="body/lg/semibold">Pull request triggers</Text>}
          marginY="12"
        >
          {triggers.pull_request?.map((trigger: any) => (
            <TriggerItem
              key={trigger}
              onDeleteClick={() => onTriggerDelete(trigger, 'pull_request')}
              onTriggerEdit={onTriggerEdit}
              trigger={trigger}
            />
          ))}
          <Button
            margin="24"
            size="md"
            variant="secondary"
            leftIconName="PlusAdd"
            onClick={() => {
              setTriggerType('pull_request');
            }}
          >
            Add pull request trigger
          </Button>
        </ExpandableCard>
        <ExpandableCard padding="0" buttonContent={<Text textStyle="body/lg/semibold">Tag triggers</Text>}>
          {triggers.tag?.map((trigger: any) => (
            <TriggerItem
              key={trigger}
              onDeleteClick={() => onTriggerDelete(trigger, 'tag')}
              trigger={trigger}
              onTriggerEdit={onTriggerEdit}
            />
          ))}
          <Button
            margin="24"
            size="md"
            variant="secondary"
            leftIconName="PlusAdd"
            onClick={() => {
              setTriggerType('tag');
            }}
          >
            Add tag trigger
          </Button>
        </ExpandableCard>
      </Box>
    </>
  );
};

export default TriggersTabPanel;
