import { Button, Link, Tab, TabList, TabPanel, TabPanels, Tabs, Text, useDisclosure } from '@bitrise/bitkit';
import { useState } from 'react';

import { TriggerType } from '@/core/models/Trigger';
import { LegacyTrigger } from '@/core/models/Trigger.legacy';
import TriggerService from '@/core/services/TriggerService';
import useLegacyTriggers from '@/hooks/useLegacyTriggers';
import SortableTriggerList from '@/pages/TriggersPage/components/LegacyTriggers/SortableTriggerList';

import AddPrTriggerDialog from './AddPrTriggerDialog';
import AddPushTriggerDialog from './AddPushTriggerDialog';
import AddTagTriggerDialog from './AddTagTriggerDialog';
import ConvertLegacyTriggers from './ConvertLegacyTriggers';

const LegacyTriggers = () => {
  const triggers = useLegacyTriggers();
  const [editedItem, setEditedItem] = useState<LegacyTrigger | undefined>();

  const onTriggerAdded = (trigger: LegacyTrigger) => {
    TriggerService.addLegacyTrigger(trigger);
  };

  const onTriggerEdited = (trigger: LegacyTrigger) => {
    TriggerService.updateLegacyTrigger(trigger);
  };

  const onTriggerRemoved = (trigger: LegacyTrigger) => {
    TriggerService.removeLegacyTrigger(trigger.index);
  };

  const onReorder = (type: TriggerType, newTriggers: LegacyTrigger[]) => {
    const newTriggersMap = { ...triggers };
    newTriggersMap[type] = newTriggers;
    TriggerService.updateTriggerMap(newTriggersMap);
  };

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

  const onOpenDialog = (trigger: LegacyTrigger) => {
    setEditedItem(trigger);
    switch (trigger.triggerType) {
      case 'push':
        openPushTriggerDialog();
        break;
      case 'pull_request':
        openPrTriggerDialog();
        break;
      case 'tag':
        openTagTriggerDialog();
        break;
      default:
        break;
    }
  };

  const onCloseDialog = () => {
    closePushTriggerDialog();
    closePrTriggerDialog();
    closeTagTriggerDialog();
    setEditedItem(undefined);
  };

  if (triggers.push.length + triggers.pull_request.length + triggers.tag.length === 0) {
    return null;
  }

  return (
    <>
      <Text as="h3" textStyle="heading/h3" marginBottom="4">
        Legacy triggers
      </Text>
      <Text color="text/secondary">
        A project-based trigger map. When a Git event occurs, only the first matching trigger will be executed.{' '}
        <Link
          colorScheme="purple"
          href="https://devcenter.bitrise.io/en/builds/starting-builds/triggering-builds-automatically.html"
          isExternal
        >
          Learn more
        </Link>
      </Text>
      <ConvertLegacyTriggers triggers={triggers} />
      <Tabs marginTop="24" marginBottom="24">
        <TabList>
          <Tab>Push</Tab>
          <Tab>Pull request</Tab>
          <Tab>Tag</Tab>
        </TabList>
        <TabPanels paddingTop="24">
          <TabPanel>
            <Button marginBottom="24" variant="secondary" onClick={openPushTriggerDialog} leftIconName="PlusCircle">
              Add push trigger
            </Button>
            <SortableTriggerList
              type="push"
              triggers={triggers.push}
              onEditItem={onOpenDialog}
              onToggleItem={onTriggerEdited}
              onRemoveItem={onTriggerRemoved}
              onReorder={onReorder}
            />
          </TabPanel>
          <TabPanel>
            <Button marginBottom="24" variant="secondary" onClick={openPrTriggerDialog} leftIconName="PlusCircle">
              Add pull request trigger
            </Button>
            <SortableTriggerList
              type="pull_request"
              triggers={triggers.pull_request}
              onEditItem={onOpenDialog}
              onToggleItem={onTriggerEdited}
              onRemoveItem={onTriggerRemoved}
              onReorder={onReorder}
            />
          </TabPanel>
          <TabPanel>
            <Button marginBottom="24" variant="secondary" onClick={openTagTriggerDialog} leftIconName="PlusCircle">
              Add tag trigger
            </Button>
            <SortableTriggerList
              type="tag"
              triggers={triggers.tag}
              onEditItem={onOpenDialog}
              onToggleItem={onTriggerEdited}
              onRemoveItem={onTriggerRemoved}
              onReorder={onReorder}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
      <AddPushTriggerDialog
        isOpen={isPushTriggerDialogOpen}
        editedItem={editedItem}
        currentTriggers={triggers.push}
        onAdd={onTriggerAdded}
        onEdit={onTriggerEdited}
        onClose={onCloseDialog}
      />
      <AddPrTriggerDialog
        isOpen={isPrTriggerDialogOpen}
        editedItem={editedItem}
        currentTriggers={triggers.pull_request}
        onAdd={onTriggerAdded}
        onEdit={onTriggerEdited}
        onClose={onCloseDialog}
      />
      <AddTagTriggerDialog
        isOpen={isTagTriggerDialogOpen}
        editedItem={editedItem}
        currentTriggers={triggers.tag}
        onAdd={onTriggerAdded}
        onEdit={onTriggerEdited}
        onClose={onCloseDialog}
      />
    </>
  );
};

export default LegacyTriggers;
