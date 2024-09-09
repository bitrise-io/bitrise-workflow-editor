/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import {
  Button,
  EmptyState,
  Link,
  Notification,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useDisclosure,
} from '@bitrise/bitkit';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToParentElement, restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import { useUserMetaData } from '@/hooks/useUserMetaData';
import {
  convertItemsToTriggerMap,
  convertTriggerMapToItems,
  createOnTriggersChange,
} from '../WorkflowsPage/components/WorkflowConfigPanel/SelectiveTriggering/SelectiveTriggeringFunctions';
import AddPrTriggerDialog from './AddPrTriggerDialog';
import AddPushTriggerDialog from './AddPushTriggerDialog';
import AddTagTriggerDialog from './AddTagTriggerDialog';
import TriggerCard from './TriggerCard';
import { SourceType, TriggerItem, TriggersPageProps } from './TriggersPage.types';

const TRIGGERS_CONFIGURED_METADATA_KEY = 'wfe_triggers_configure_webhooks_notification_closed';
const ORDER_NOTIFICATION_METADATA_KEY = 'wfe_triggers_order_notification_closed';

const TriggersPage = (props: TriggersPageProps) => {
  const { integrationsUrl, isWebsiteMode, onTriggerMapChange, pipelines, triggerMap, setDiscard, workflows } = props;

  const { isVisible: isWebhookNotificationOpen, close: closeWebhookNotification } = useUserMetaData({
    key: TRIGGERS_CONFIGURED_METADATA_KEY,
    enabled: isWebsiteMode,
  });
  const { isVisible: isOrderNotificationOpen, close: closeOrderNotification } = useUserMetaData({
    key: ORDER_NOTIFICATION_METADATA_KEY,
    enabled: isWebsiteMode,
  });

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

  const [triggers, setTriggers] = useState<Record<SourceType, TriggerItem[]>>(
    convertTriggerMapToItems(triggerMap || []),
  );

  const [editedItem, setEditedItem] = useState<TriggerItem | undefined>();

  const [activeId, setActiveId] = useState<string | null>(null);

  const onCloseDialog = () => {
    closePushTriggerDialog();
    closePrTriggerDialog();
    closeTagTriggerDialog();
    setEditedItem(undefined);
  };

  const onTriggersChange = createOnTriggersChange(triggers, setTriggers, onTriggerMapChange);

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

  useEffect(() => {
    setDiscard((originalTriggerMap) => {
      setTriggers(convertTriggerMapToItems(originalTriggerMap || []));
    });
  }, [setDiscard]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;

    setActiveId(active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent, type: SourceType) => {
    const { active, over } = event;
    const items = triggers[type];

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over?.id);
      const newItems = arrayMove(items, oldIndex, newIndex);
      const newTriggers = {
        ...triggers,
        [type]: newItems,
      };
      setActiveId(null);
      setTriggers(newTriggers);
      onTriggerMapChange(convertItemsToTriggerMap(newTriggers));
    }
  };

  return (
    <>
      <Text as="h2" textStyle="heading/h2" marginBottom="4">
        Triggers
      </Text>
      <Text color="text/secondary">
        Triggers help you start builds automatically.{' '}
        <Link
          colorScheme="purple"
          href="https://devcenter.bitrise.io/en/builds/starting-builds/triggering-builds-automatically.html"
          isExternal
        >
          Learn more
        </Link>
      </Text>
      {isWebhookNotificationOpen && (
        <Notification
          status="info"
          onClose={closeWebhookNotification}
          action={{ href: integrationsUrl, label: 'Set up webhooks' }}
          marginTop="32"
        >
          <Text fontWeight="bold">Configure webhooks</Text>
          <Text>Enable Bitrise to interact with third-party services and are necessary for triggers to work.</Text>
        </Notification>
      )}
      <Tabs marginTop="24" marginBottom="24">
        <TabList>
          <Tab id="push">Push</Tab>
          <Tab id="pullRequest">Pull request</Tab>
          <Tab id="tag">Tag</Tab>
        </TabList>
        <TabPanels paddingTop="24">
          <TabPanel>
            <Button marginBottom="24" variant="secondary" onClick={openPushTriggerDialog} leftIconName="PlusAdd">
              Add push trigger
            </Button>
            {triggers.push.length === 0 && (
              <EmptyState iconName="Trigger" title="Your push triggers will appear here" maxHeight="208">
                <Text marginTop="8">
                  A push based trigger automatically starts builds when commits are pushed to your repository.{' '}
                  <Link
                    colorScheme="purple"
                    href="https://devcenter.bitrise.io/en/builds/starting-builds/triggering-builds-automatically.html"
                  >
                    Learn more
                  </Link>
                </Text>
              </EmptyState>
            )}
            <div>
              <DndContext
                collisionDetection={closestCenter}
                modifiers={[restrictToParentElement, restrictToVerticalAxis, restrictToWindowEdges]}
                onDragStart={handleDragStart}
                onDragEnd={(event) => handleDragEnd(event, 'push')}
                sensors={sensors}
              >
                <SortableContext strategy={verticalListSortingStrategy} items={triggers.push.map(({ id }) => id)}>
                  {triggers.push.length > 0 &&
                    triggers.push.map((triggerItem) => (
                      <TriggerCard
                        key={triggerItem.id}
                        triggerItem={triggerItem}
                        onRemove={(trigger) => onTriggersChange('remove', trigger)}
                        onEdit={(trigger) => onPushTriggerEdit(trigger)}
                        onActiveChange={(trigger) => onTriggersChange('edit', trigger)}
                      />
                    ))}
                </SortableContext>
                <DragOverlay>
                  {activeId ? (
                    <TriggerCard
                      triggerItem={triggers.push.find(({ id }) => id === activeId) || triggers.push[0]}
                      isOverlay
                    />
                  ) : null}
                </DragOverlay>
              </DndContext>
            </div>
            {triggers.push.length > 1 && isOrderNotificationOpen && (
              <Notification status="info" marginTop="12" onClose={closeOrderNotification}>
                <Text fontWeight="bold">Order of triggers</Text>
                <Text>
                  The first matching trigger is executed by the system, so make sure that the order of triggers is
                  configured correctly.{' '}
                  <Link
                    href="https://devcenter.bitrise.io/en/builds/starting-builds/triggering-builds-automatically.html"
                    isUnderlined
                  >
                    Learn more
                  </Link>
                </Text>
              </Notification>
            )}
          </TabPanel>
          <TabPanel>
            <Button marginBottom="24" variant="secondary" onClick={openPrTriggerDialog} leftIconName="PlusAdd">
              Add pull request trigger
            </Button>
            {triggers.pull_request.length === 0 && (
              <EmptyState iconName="Trigger" title="Your pull request triggers will appear here" maxHeight="208">
                <Text marginTop="8">
                  A pull request based trigger automatically starts builds when specific PR related actions detected
                  within your repository.{' '}
                  <Link
                    colorScheme="purple"
                    href="https://devcenter.bitrise.io/en/builds/starting-builds/triggering-builds-automatically.html"
                  >
                    Learn more
                  </Link>
                </Text>
              </EmptyState>
            )}
            <div>
              <DndContext
                collisionDetection={closestCenter}
                modifiers={[restrictToParentElement, restrictToVerticalAxis, restrictToWindowEdges]}
                onDragStart={handleDragStart}
                onDragEnd={(event) => handleDragEnd(event, 'pull_request')}
                sensors={sensors}
              >
                <SortableContext
                  strategy={verticalListSortingStrategy}
                  items={triggers.pull_request.map(({ id }) => id)}
                >
                  {triggers.pull_request.length > 0 &&
                    triggers.pull_request.map((triggerItem) => (
                      <TriggerCard
                        key={triggerItem.id}
                        triggerItem={triggerItem}
                        onRemove={(trigger) => onTriggersChange('remove', trigger)}
                        onEdit={(trigger) => onPrTriggerEdit(trigger)}
                        onActiveChange={(trigger) => onTriggersChange('edit', trigger)}
                      />
                    ))}
                </SortableContext>
                <DragOverlay>
                  {activeId ? (
                    <TriggerCard
                      triggerItem={triggers.pull_request.find(({ id }) => id === activeId) || triggers.pull_request[0]}
                      isOverlay
                    />
                  ) : null}
                </DragOverlay>
              </DndContext>
            </div>
            {triggers.pull_request.length > 1 && isOrderNotificationOpen && (
              <Notification status="info" marginTop="12" onClose={closeOrderNotification}>
                <Text fontWeight="bold">Order of triggers</Text>
                <Text>
                  The first matching trigger is executed by the system, so make sure that the order of triggers is
                  configured correctly.{' '}
                  <Link
                    href="https://devcenter.bitrise.io/en/builds/starting-builds/triggering-builds-automatically.html"
                    isUnderlined
                  >
                    Learn more
                  </Link>
                </Text>
              </Notification>
            )}
          </TabPanel>
          <TabPanel>
            <Button marginBottom="24" variant="secondary" onClick={openTagTriggerDialog} leftIconName="PlusAdd">
              Add tag trigger
            </Button>
            {triggers.tag.length === 0 && (
              <EmptyState iconName="Trigger" title="Your tag triggers will appear here" maxHeight="208">
                <Text marginTop="8">
                  A tag-based trigger automatically starts builds when tags gets pushed to your repository.{' '}
                  <Link
                    colorScheme="purple"
                    href="https://devcenter.bitrise.io/en/builds/starting-builds/triggering-builds-automatically.html"
                  >
                    Learn more
                  </Link>
                </Text>
              </EmptyState>
            )}
            <div>
              <DndContext
                collisionDetection={closestCenter}
                modifiers={[restrictToParentElement, restrictToVerticalAxis, restrictToWindowEdges]}
                onDragStart={handleDragStart}
                onDragEnd={(event) => handleDragEnd(event, 'tag')}
                sensors={sensors}
              >
                <SortableContext strategy={verticalListSortingStrategy} items={triggers.tag.map(({ id }) => id)}>
                  {triggers.tag.length > 0 &&
                    triggers.tag.map((triggerItem) => (
                      <TriggerCard
                        key={triggerItem.id}
                        triggerItem={triggerItem}
                        onRemove={(trigger) => onTriggersChange('remove', trigger)}
                        onEdit={(trigger) => onTagTriggerEdit(trigger)}
                        onActiveChange={(trigger) => onTriggersChange('edit', trigger)}
                      />
                    ))}
                </SortableContext>
                <DragOverlay>
                  {activeId ? (
                    <TriggerCard
                      triggerItem={triggers.tag.find(({ id }) => id === activeId) || triggers.tag[0]}
                      isOverlay
                    />
                  ) : null}
                </DragOverlay>
              </DndContext>
            </div>
            {triggers.tag.length > 1 && isOrderNotificationOpen && (
              <Notification status="info" marginTop="12" onClose={closeOrderNotification}>
                <Text fontWeight="bold">Order of triggers</Text>
                <Text>
                  The first matching trigger is executed by the system, so make sure that the order of triggers is
                  configured correctly.{' '}
                  <Link
                    href="https://devcenter.bitrise.io/en/builds/starting-builds/triggering-builds-automatically.html"
                    isUnderlined
                  >
                    Learn more
                  </Link>
                </Text>
              </Notification>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
      <AddPushTriggerDialog
        currentTriggers={triggers.push}
        onClose={onCloseDialog}
        isOpen={isPushTriggerDialogOpen}
        onSubmit={onTriggersChange}
        editedItem={editedItem}
        pipelines={pipelines}
        workflows={workflows}
      />
      <AddPrTriggerDialog
        currentTriggers={triggers.pull_request}
        isOpen={isPrTriggerDialogOpen}
        onClose={onCloseDialog}
        onSubmit={onTriggersChange}
        editedItem={editedItem}
        pipelines={pipelines}
        workflows={workflows}
      />
      <AddTagTriggerDialog
        currentTriggers={triggers.tag}
        isOpen={isTagTriggerDialogOpen}
        onClose={onCloseDialog}
        onSubmit={onTriggersChange}
        pipelines={pipelines}
        workflows={workflows}
        editedItem={editedItem}
      />
    </>
  );
};

export default TriggersPage;
