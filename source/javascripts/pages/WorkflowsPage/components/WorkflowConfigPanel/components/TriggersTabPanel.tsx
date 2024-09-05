import { useState } from 'react';
import { Button, ExpandableCard, Link, Notification, TabPanel, Text, useDisclosure } from '@bitrise/bitkit';
import { WorkflowConfigTab } from '../WorkflowConfigPanel.types';
import { FinalTriggerItem, TriggersPageProps, convertTriggerMapToItems } from '../../../../TriggersPage/TriggersPage';
import { SourceType, TriggerItem } from '../../../../TriggersPage/TriggersPage.types';
import AddTriggerDialog from '../SelectiveTriggering/AddTriggerDialog';

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

const TriggersTabPanel = (props: TriggersPageProps) => {
  const { workflows, pipelines, triggerMap, onTriggerMapChange } = props;

  const [editedItem, setEditedItem] = useState<TriggerItem | undefined>();
  const [triggers, setTriggers] = useState<Record<SourceType, TriggerItem[]>>(
    convertTriggerMapToItems(triggerMap || []),
  );

  const {
    isOpen: isPushTriggerDialogOpen,
    onOpen: openPushTriggerDialog,
    onClose: closePushTriggerDialog,
  } = useDisclosure();

  const { isOpen: isPrTriggerDialogOpen, onOpen: openPrTriggerDialog, onClose: closePrTriggerDialog } = useDisclosure();

  const {
    isOpen: isTagTriggerDialogOpen,
    onOpen: openTagTriggerDialog,
    onClose: closeTagTriggerDialog,
  } = useDisclosure();

  const onCloseDialog = () => {
    closePushTriggerDialog();
    closePrTriggerDialog();
    closeTagTriggerDialog();
    setEditedItem(undefined);
  };

  const onTriggersChange = (action: 'add' | 'remove' | 'edit', trigger: TriggerItem) => {
    const newTriggers = { ...triggers };
    if (action === 'add') {
      newTriggers[trigger.source].push(trigger);
    }
    if (action === 'remove') {
      newTriggers[trigger.source] = triggers[trigger.source].filter(({ id }) => id !== trigger.id);
    }
    if (action === 'edit') {
      const index = triggers[trigger.source].findIndex(({ id }) => id === trigger.id);
      newTriggers[trigger.source][index] = trigger;
    }
    setTriggers(newTriggers);
    onTriggerMapChange(convertItemsToTriggerMap(newTriggers));
  };

  const onPushTriggerEdit = (trigger: TriggerItem) => {
    setEditedItem(trigger);
    openPushTriggerDialog();
  };

  const onPrTriggerEdit = (trigger: TriggerItem) => {
    setEditedItem(trigger);
    openPrTriggerDialog();
  };

  const onTagTriggerEdit = (trigger: TriggerItem) => {
    setEditedItem(trigger);
    openTagTriggerDialog();
  };

  return (
    <TabPanel id={WorkflowConfigTab.TRIGGERS}>
      <Notification status="info" marginY="24">
        <Text textStyle="heading/h4">Workflow based triggers</Text>
        <Text>
          Set up triggers directly in your Workflows or Pipelines. This way a single Git event can trigger multiple
          Workflows or Pipelines.{' '}
          <Link href="https://devcenter.bitrise.io/" isUnderlined>
            Learn more
          </Link>
        </Text>
      </Notification>
      <ExpandableCard buttonContent={<Text textStyle="body/lg/semibold">Push triggers</Text>}>
        <Button variant="secondary" onClick={openPushTriggerDialog} leftIconName="PlusAdd">
          Add push trigger
        </Button>
      </ExpandableCard>
      <ExpandableCard buttonContent={<Text textStyle="body/lg/semibold">Pull request triggers</Text>} marginY="12">
        <Button variant="secondary" onClick={openPrTriggerDialog} leftIconName="PlusAdd">
          Add pull request trigger
        </Button>
      </ExpandableCard>
      <ExpandableCard buttonContent={<Text textStyle="body/lg/semibold">Tag triggers</Text>}>
        <Button variant="secondary" onClick={openTagTriggerDialog} leftIconName="PlusAdd">
          Add tag trigger
        </Button>
      </ExpandableCard>
      <AddTriggerDialog
        currentTriggers={triggers.push}
        onClose={onCloseDialog}
        isOpen={isPushTriggerDialogOpen}
        onSubmit={onTriggersChange}
        editedItem={editedItem}
      />
    </TabPanel>
  );
};

export default TriggersTabPanel;
