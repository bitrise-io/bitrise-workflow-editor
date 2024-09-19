/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from 'react';
import isObject from 'lodash/isObject';
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
import { useShallow } from 'zustand/react/shallow';
import { restrictToParentElement, restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import { useUserMetaData } from '@/hooks/useUserMetaData';
import WindowUtils from '@/core/utils/WindowUtils';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import { BitriseYml } from '@/core/models/BitriseYml';
import BitriseYmlProvider from '@/contexts/BitriseYmlProvider';
import { TriggerMapYml, TriggerYmlObject } from '@/core/models/TriggerMap';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import AddPrTriggerDialog from './AddPrTriggerDialog';
import AddPushTriggerDialog from './AddPushTriggerDialog';
import AddTagTriggerDialog from './AddTagTriggerDialog';
import TriggerCard from './TriggerCard';
import { ConditionType, SourceType, TriggerItem } from './TriggersPage.types';
import { getPipelineableTriggers } from './TriggersPage.utils';
import SelectiveTriggers from './SelectiveTriggers';

const convertItemsToTriggerMap = (triggers: Record<SourceType, TriggerItem[]>): TriggerMapYml => {
  const triggerMap: TriggerMapYml = Object.values(triggers)
    .flat()
    .map((trigger) => {
      const finalItem: TriggerYmlObject = {};
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
      finalItem[pipelinableType as 'workflow' | 'pipeline'] = pipelinableName;
      return finalItem;
    });

  return triggerMap;
};

const getSourceType = (triggerKeys: string[], type?: SourceType): SourceType => {
  if (type) {
    return type;
  }
  if (triggerKeys.includes('push_branch')) {
    return 'push';
  }
  if (triggerKeys.includes('tag')) {
    return 'tag';
  }
  return 'pull_request';
};

const convertTriggerMapToItems = (triggerMap: TriggerMapYml): Record<SourceType, TriggerItem[]> => {
  const triggers: Record<SourceType, TriggerItem[]> = {
    pull_request: [],
    push: [],
    tag: [],
  };

  triggerMap.forEach((trigger) => {
    const triggerKeys = Object.keys(trigger) as (keyof TriggerYmlObject)[];
    const source = getSourceType(triggerKeys, trigger.type as SourceType);
    const finalItem: TriggerItem = {
      conditions: [],
      pipelineable: trigger.workflow as string,
      id: crypto.randomUUID(),
      source,
      isActive: trigger.enabled !== false,
    };

    if (source === 'pull_request') {
      if (trigger.draft_pull_request_enabled !== false) {
        finalItem.isDraftPr = true;
      } else {
        finalItem.isDraftPr = false;
      }
    }

    if (trigger.workflow) {
      finalItem.pipelineable = `workflow#${trigger.workflow}`;
    }
    if (trigger.pipeline) {
      finalItem.pipelineable = `pipeline#${trigger.pipeline}`;
    }

    triggerKeys.forEach((key) => {
      if (!['workflow', 'enabled', 'draft_pull_request_enabled', 'type', 'pipeline'].includes(key)) {
        const isRegex = isObject(trigger[key]);
        finalItem.conditions.push({
          isRegex,
          type: key as ConditionType,
          value: isRegex ? (trigger[key] as { regex: string }).regex : (trigger[key] as string),
        });
      }
    });
    triggers[source].push(finalItem);
  });
  return triggers;
};

const TRIGGERS_CONFIGURED_METADATA_KEY = 'wfe_triggers_configure_webhooks_notification_closed';
const ORDER_NOTIFICATION_METADATA_KEY = 'wfe_triggers_order_notification_closed';

type TriggersPageContentProps = {
  yml: BitriseYml;
};

const TriggersPageContent = (props: TriggersPageContentProps) => {
  const { yml } = props;
  // console.log(yml);

  const appSlug = WindowUtils.appSlug() ?? '';
  const isWebsiteMode = RuntimeUtils.isWebsiteMode();

  const pipelines = yml.pipelines ? Object.keys(yml.pipelines) : [];
  const workflows = yml.workflows ? Object.keys(yml.workflows).filter((workflowID) => !workflowID.startsWith('_')) : [];

  const triggerMap = yml.trigger_map;

  const pipelineableTriggers = getPipelineableTriggers(yml);
  console.log('pipelineableTriggers', pipelineableTriggers);
  // pipelineableTriggers.forEach((trigger) => {});

  const integrationsUrl = appSlug ? `/app/${appSlug}/settings/integrations?tab=webhooks` : '';

  const { updateTriggerMap } = useBitriseYmlStore(
    useShallow((s) => ({
      updateTriggerMap: s.updateTriggerMap,
    })),
  );

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
    updateTriggerMap(convertItemsToTriggerMap(newTriggers));
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
      updateTriggerMap(convertItemsToTriggerMap(newTriggers));
    }
  };

  return (
    <>
      <Text as="h2" textStyle="heading/h2" marginBlockEnd="4">
        Triggers
      </Text>
      <Text color="text/secondary" marginBlockEnd="32">
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
          marginY="32"
        >
          <Text fontWeight="bold">Configure webhooks</Text>
          <Text>Enable Bitrise to interact with third-party services and are necessary for triggers to work.</Text>
        </Notification>
      )}
      <SelectiveTriggers pipelineableTriggers={pipelineableTriggers} />
      <Text as="h3" textStyle="heading/h3" marginBottom="4">
        Legacy triggers
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

type Props = {
  onChange: (yml: BitriseYml) => void;
  yml: BitriseYml;
};

const TriggersPage = ({ onChange, yml }: Props) => {
  return (
    <BitriseYmlProvider yml={yml} onChange={onChange}>
      <TriggersPageContent yml={yml} />
    </BitriseYmlProvider>
  );
};

export default TriggersPage;
