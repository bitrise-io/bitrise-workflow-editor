import { Button, Link, Tab, TabList, TabPanel, TabPanels, Tabs, Text, useDisclosure } from '@bitrise/bitkit';
import { useState } from 'react';

import AddOrEditTriggerDialog from '@/components/unified-editor/Triggers/TargetBasedTriggers/AddOrEditTriggerDialog';
import { TriggerType } from '@/core/models/Trigger';
import { LegacyTrigger } from '@/core/models/Trigger.legacy';
import TriggerService from '@/core/services/TriggerService';
import useLegacyTriggers from '@/hooks/useLegacyTriggers';
import SortableTriggerList from '@/pages/TriggersPage/components/LegacyTriggers/SortableTriggerList';

import ConvertLegacyTriggers from './ConvertLegacyTriggers';

const LegacyTriggers = () => {
  const triggers = useLegacyTriggers();
  const [triggerType, setTriggerType] = useState<TriggerType>('push');
  const [editedItem, setEditedItem] = useState<LegacyTrigger | undefined>();
  const [tabIndex, setTabIndex] = useState(0);

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

  const { isOpen, onOpen, onClose } = useDisclosure();

  const onOpenDialog = (trigger: LegacyTrigger) => {
    setEditedItem(trigger);
    setTriggerType(trigger.triggerType);
    onOpen();
  };

  const onCloseDialog = () => {
    onClose();
    setEditedItem(undefined);
  };

  const onSubmit = (trigger: LegacyTrigger) => {
    if (editedItem) {
      TriggerService.updateLegacyTrigger(trigger);
    } else {
      TriggerService.addLegacyTrigger(trigger);
    }
    onCloseDialog();
  };

  const handleTabChange = (index: number) => {
    setTabIndex(index);
    const triggerTypes: TriggerType[] = ['push', 'pull_request', 'tag'];
    setTriggerType(triggerTypes[index]);
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
      <Tabs marginTop="24" marginBottom="24" index={tabIndex} onChange={handleTabChange}>
        <TabList>
          <Tab>Push</Tab>
          <Tab>Pull request</Tab>
          <Tab>Tag</Tab>
        </TabList>
        <TabPanels paddingTop="24">
          <TabPanel>
            <Button marginBottom="24" variant="secondary" size="md" onClick={onOpen} leftIconName="Plus">
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
            <Button marginBottom="24" variant="secondary" size="md" onClick={onOpen} leftIconName="Plus">
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
            <Button marginBottom="24" variant="secondary" size="md" onClick={onOpen} leftIconName="Plus">
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
      <AddOrEditTriggerDialog
        triggerType={triggerType}
        currentTriggers={triggers[triggerType]}
        editedItem={editedItem}
        onSubmit={onSubmit}
        onCancel={onCloseDialog}
        isOpen={isOpen}
        variant="legacy"
        source=""
        sourceId=""
        showTarget
      />
    </>
  );
};

export default LegacyTriggers;
