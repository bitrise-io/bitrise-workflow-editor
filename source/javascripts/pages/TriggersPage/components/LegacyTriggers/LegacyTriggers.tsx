import { BitkitButton, BitkitHeading, BitkitLink, BitkitTabs, IconPlus } from '@bitrise/bitkit-v2';
import { useDisclosure } from '@chakra-ui/react/hooks';
import { Text } from '@chakra-ui/react/text';
import { useState } from 'react';

import AddOrEditTriggerDialog from '@/components/unified-editor/Triggers/TargetBasedTriggers/AddOrEditTriggerDialog';
import { TriggerType } from '@/core/models/Trigger';
import { LegacyTrigger } from '@/core/models/Trigger.legacy';
import TriggerService from '@/core/services/TriggerService';
import useLegacyTriggers from '@/hooks/useLegacyTriggers';
import { useIsReadOnlyView } from '@/hooks/useTree';
import SortableTriggerList from '@/pages/TriggersPage/components/LegacyTriggers/SortableTriggerList';

import ConvertLegacyTriggers from './ConvertLegacyTriggers';

const LegacyTriggers = () => {
  const isReadOnlyView = useIsReadOnlyView();
  const triggers = useLegacyTriggers();
  const [triggerType, setTriggerType] = useState<TriggerType>('push');
  const [editedItem, setEditedItem] = useState<LegacyTrigger | undefined>();
  const [selectedTab, setSelectedTab] = useState<TriggerType>('push');

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

  const { open: isOpen, onOpen, onClose } = useDisclosure();

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

  const handleTabChange = ({ value }: { value: string }) => {
    setSelectedTab(value as TriggerType);
    setTriggerType(value as TriggerType);
  };

  if (triggers.push.length + triggers.pull_request.length + triggers.tag.length === 0) {
    return null;
  }

  return (
    <>
      <BitkitHeading as="h3" marginBlockEnd="4" data-clarity-unmask="true">
        Legacy triggers
      </BitkitHeading>
      <Text color="text/secondary" data-clarity-unmask="true">
        A project-based trigger map. When a Git event occurs, only the first matching trigger will be executed.{' '}
        <BitkitLink
          colorVariant="purple"
          href="https://docs.bitrise.io/en/bitrise-ci/run-and-analyze-builds/starting-builds/triggering-builds-automatically.html"
          isExternal
        >
          Learn more
        </BitkitLink>
      </Text>
      {!isReadOnlyView && <ConvertLegacyTriggers triggers={triggers} />}
      <BitkitTabs.Root marginBlock="24" value={selectedTab} onValueChange={handleTabChange}>
        <BitkitTabs.List data-clarity-unmask="true">
          <BitkitTabs.Trigger value="push">Push</BitkitTabs.Trigger>
          <BitkitTabs.Trigger value="pull_request">Pull request</BitkitTabs.Trigger>
          <BitkitTabs.Trigger value="tag">Tag</BitkitTabs.Trigger>
        </BitkitTabs.List>
        <BitkitTabs.ContentGroup paddingBlockStart="24">
          <BitkitTabs.Content value="push">
            {!isReadOnlyView && (
              <BitkitButton marginBottom="24" variant="secondary" size="md" onClick={onOpen} icon={IconPlus}>
                Add push trigger
              </BitkitButton>
            )}
            <SortableTriggerList
              type="push"
              triggers={triggers.push}
              onEditItem={onOpenDialog}
              onToggleItem={onTriggerEdited}
              onRemoveItem={onTriggerRemoved}
              onReorder={onReorder}
            />
          </BitkitTabs.Content>
          <BitkitTabs.Content value="pull_request">
            {!isReadOnlyView && (
              <BitkitButton marginBottom="24" variant="secondary" size="md" onClick={onOpen} icon={IconPlus}>
                Add pull request trigger
              </BitkitButton>
            )}
            <SortableTriggerList
              type="pull_request"
              triggers={triggers.pull_request}
              onEditItem={onOpenDialog}
              onToggleItem={onTriggerEdited}
              onRemoveItem={onTriggerRemoved}
              onReorder={onReorder}
            />
          </BitkitTabs.Content>
          <BitkitTabs.Content value="tag">
            {!isReadOnlyView && (
              <BitkitButton marginBottom="24" variant="secondary" size="md" onClick={onOpen} icon={IconPlus}>
                Add tag trigger
              </BitkitButton>
            )}
            <SortableTriggerList
              type="tag"
              triggers={triggers.tag}
              onEditItem={onOpenDialog}
              onToggleItem={onTriggerEdited}
              onRemoveItem={onTriggerRemoved}
              onReorder={onReorder}
            />
          </BitkitTabs.Content>
        </BitkitTabs.ContentGroup>
      </BitkitTabs.Root>
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
