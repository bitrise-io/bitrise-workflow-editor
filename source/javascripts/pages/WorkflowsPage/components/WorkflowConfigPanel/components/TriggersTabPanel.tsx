import { useState } from 'react';
import { Button, ExpandableCard, Link, Notification, TabPanel, Text, useDisclosure } from '@bitrise/bitkit';
import { WorkflowConfigTab } from '../WorkflowConfigPanel.types';
import { SourceType, TriggerItem, TriggersPageProps } from '../../../../TriggersPage/TriggersPage.types';
import AddTriggerDialog from '../SelectiveTriggering/AddTriggerDialog';
import { convertTriggerMapToItems, createOnTriggersChange } from '../SelectiveTriggering/SelectiveTriggeringFunctions';
import { useUserMetaData } from '../../../../../hooks/useUserMetaData';
import NewTriggerCard from '../SelectiveTriggering/NewTriggerCard';

const TriggersTabPanel = (props: TriggersPageProps) => {
  const { workflowId, pipelines, triggerMap, onTriggerMapChange, isWebsiteMode } = props;

  const [editedItem, setEditedItem] = useState<TriggerItem | undefined>();
  const [triggers, setTriggers] = useState<Record<SourceType, TriggerItem[]>>(
    convertTriggerMapToItems(triggerMap || []),
  );

  const { isOpen, onOpen, onClose } = useDisclosure();

  const onCloseDialog = () => {
    onClose();
    setEditedItem(undefined);
  };

  const { isVisible: isNotificationVisible, close: closeNotification } = useUserMetaData({
    key: 'selective_triggering_notification_closed',
    enabled: isWebsiteMode,
  });

  const onTriggersChange = createOnTriggersChange(triggers, setTriggers, onTriggerMapChange);

  const onEdit = (trigger: TriggerItem) => {
    setEditedItem(trigger);
    onOpen();
  };

  const handleOpen = () => {
    onOpen();
  };

  return (
    <TabPanel id={WorkflowConfigTab.TRIGGERS}>
      {isNotificationVisible && (
        <Notification status="info" onClose={closeNotification} marginBlockStart="24">
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
      <ExpandableCard buttonContent={<Text textStyle="body/lg/semibold">Push triggers</Text>} marginBlockStart="24">
        {triggers.push.length > 0 &&
          triggers.push.map((triggerItem) => (
            <NewTriggerCard
              key={triggerItem.id}
              triggerItem={triggerItem}
              onRemove={(trigger) => onTriggersChange('remove', trigger)}
            />
          ))}
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
        workflowId={workflowId}
      />
    </TabPanel>
  );
};

export default TriggersTabPanel;
