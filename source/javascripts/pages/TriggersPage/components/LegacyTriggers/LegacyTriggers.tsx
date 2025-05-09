import { Button, Link, Tab, TabList, TabPanel, TabPanels, Tabs, Text, useDisclosure } from '@bitrise/bitkit';
import { useState } from 'react';

import { TriggerItem, TriggerType } from '@/components/unified-editor/Triggers/Triggers.types';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import SortableTriggerList from '@/pages/TriggersPage/components/LegacyTriggers/SortableTriggerList';

import { convertItemsToTriggerMap, convertTriggerMapToItems } from '../../TriggersPage.utils';
import AddPrTriggerDialog from './AddPrTriggerDialog';
import AddPushTriggerDialog from './AddPushTriggerDialog';
import AddTagTriggerDialog from './AddTagTriggerDialog';
import ConvertLegacyTriggers from './ConvertLegacyTriggers';

const LegacyTriggers = () => {
  const triggerMap = useBitriseYmlStore((s) => s.yml.trigger_map);

  const [editedItem, setEditedItem] = useState<TriggerItem | undefined>();
  const [triggers, setTriggers] = useState<Record<TriggerType, TriggerItem[]>>(
    convertTriggerMapToItems(triggerMap || []),
  );

  const { updateTriggerMap } = useBitriseYmlStore((s) => ({
    updateTriggerMap: s.updateTriggerMap,
  }));

  const onReorder = (type: TriggerType, newTriggers: TriggerItem[]) => {
    const newTriggersMap = { ...triggers };
    newTriggersMap[type] = newTriggers;
    setTriggers(newTriggersMap);
    updateTriggerMap(convertItemsToTriggerMap(newTriggersMap));
  };

  const onTriggersChange = (action: 'add' | 'remove' | 'edit', trigger: TriggerItem) => {
    const newTriggers = { ...triggers };

    if (action === 'add') {
      newTriggers[trigger.type].push(trigger);
    }
    if (action === 'remove') {
      newTriggers[trigger.type] = triggers[trigger.type].filter(({ uniqueId }) => uniqueId !== trigger.uniqueId);
    }
    if (action === 'edit') {
      const index = triggers[trigger.type].findIndex(({ uniqueId }) => uniqueId === trigger.uniqueId);
      newTriggers[trigger.type][index] = trigger;
    }
    setTriggers(newTriggers);
    updateTriggerMap(convertItemsToTriggerMap(newTriggers));
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

  const onOpenDialog = (trigger: TriggerItem) => {
    setEditedItem(trigger);
    switch (trigger.type) {
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

  if (!triggerMap) {
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
              onToggleItem={(trigger) => onTriggersChange('edit', trigger)}
              onRemoveItem={(trigger) => onTriggersChange('remove', trigger)}
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
              onToggleItem={(trigger) => onTriggersChange('edit', trigger)}
              onRemoveItem={(trigger) => onTriggersChange('remove', trigger)}
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
              onToggleItem={(trigger) => onTriggersChange('edit', trigger)}
              onRemoveItem={(trigger) => onTriggersChange('remove', trigger)}
              onReorder={onReorder}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
      <AddPushTriggerDialog
        isOpen={isPushTriggerDialogOpen}
        editedItem={editedItem}
        currentTriggers={triggers.push}
        onSubmit={onTriggersChange}
        onClose={onCloseDialog}
      />
      <AddPrTriggerDialog
        isOpen={isPrTriggerDialogOpen}
        editedItem={editedItem}
        currentTriggers={triggers.pull_request}
        onSubmit={onTriggersChange}
        onClose={onCloseDialog}
      />
      <AddTagTriggerDialog
        isOpen={isTagTriggerDialogOpen}
        editedItem={editedItem}
        currentTriggers={triggers.tag}
        onSubmit={onTriggersChange}
        onClose={onCloseDialog}
      />
    </>
  );
};

export default LegacyTriggers;
