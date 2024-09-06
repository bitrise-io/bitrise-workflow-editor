import { useState } from 'react';
import { Button, ExpandableCard, Link, Notification, TabPanel, Text, useDisclosure } from '@bitrise/bitkit';
import { WorkflowConfigTab } from '../WorkflowConfigPanel.types';
import { SourceType, TriggerItem, TriggersPageProps } from '../../../../TriggersPage/TriggersPage.types';
import AddTriggerDialog from '../SelectiveTriggering/AddTriggerDialog';
import {
  convertItemsToTriggerMap,
  convertTriggerMapToItems,
} from '../SelectiveTriggering/SelectiveTriggeringFunctions';

const TriggersTabPanel = (props: TriggersPageProps) => {
  const { workflows, pipelines, triggerMap, onTriggerMapChange } = props;

  const [editedItem, setEditedItem] = useState<TriggerItem | undefined>();
  const [triggers, setTriggers] = useState<Record<SourceType, TriggerItem[]>>(
    convertTriggerMapToItems(triggerMap || []),
  );

  const { isOpen, onOpen, onClose } = useDisclosure();

  const onCloseDialog = () => {
    onClose();
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

  const onEdit = (trigger: TriggerItem) => {
    setEditedItem(trigger);
    onOpen();
  };

  const handleOpen = () => {
    onOpen();
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
        <Button variant="secondary" onClick={onOpen} leftIconName="PlusAdd">
          Add push trigger
        </Button>
      </ExpandableCard>
      <ExpandableCard buttonContent={<Text textStyle="body/lg/semibold">Pull request triggers</Text>} marginY="12">
        <Button variant="secondary" onClick={onOpen} leftIconName="PlusAdd">
          Add pull request trigger
        </Button>
      </ExpandableCard>
      <ExpandableCard buttonContent={<Text textStyle="body/lg/semibold">Tag triggers</Text>}>
        <Button variant="secondary" onClick={onOpen} leftIconName="PlusAdd">
          Add tag trigger
        </Button>
      </ExpandableCard>
      <AddTriggerDialog
        currentTriggers={triggers.push}
        onClose={onCloseDialog}
        isOpen={isOpen}
        onSubmit={onTriggersChange}
        editedItem={editedItem}
        workflows={workflows}
      />
    </TabPanel>
  );
};

export default TriggersTabPanel;
