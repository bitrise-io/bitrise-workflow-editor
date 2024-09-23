import { useMemo } from 'react';
import {
  Box,
  Button,
  ExpandableCard,
  Link,
  Notification,
  OverflowMenu,
  OverflowMenuItem,
  TabPanel,
  Text,
  useDisclosure,
} from '@bitrise/bitkit';
import { useShallow } from 'zustand/react/shallow';
import { WorkflowYmlObject } from '@/core/models/Workflow';
import { useUserMetaData } from '../../../hooks/useUserMetaData';
import { WorkflowConfigTab } from '../../../components/unified-editor/WorkflowConfig/WorkflowConfig.types';
import RuntimeUtils from '../../../core/utils/RuntimeUtils';
import { useWorkflowConfigContext } from '../../../components/unified-editor/WorkflowConfig/WorkflowConfig.context';
import { getConditionList, PipelineableTriggerItem } from '../TriggersPage.utils';
import deepCloneSimpleObject from '../../../utils/deepCloneSimpleObject';
import { SourceType } from '../TriggersPage.types';
import useBitriseYmlStore from '../../../hooks/useBitriseYmlStore';
import AddTriggerDialog from './AddTriggerDialog';
import TriggerConditions from './TriggerConditions';

type TriggerItemProps = {
  onDeleteClick: () => void;
  trigger: PipelineableTriggerItem;
};

const TriggerItem = (props: TriggerItemProps) => {
  const { onDeleteClick, trigger } = props;
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
        <OverflowMenuItem leftIconName="Pencil">Edit trigger</OverflowMenuItem>
        <OverflowMenuItem isDanger leftIconName="Trash" onClick={onDeleteClick}>
          Delete trigger
        </OverflowMenuItem>
      </OverflowMenu>
    </Box>
  );
};

const TriggersTabPanel = () => {
  const isWebsiteMode = RuntimeUtils.isWebsiteMode();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const onCloseDialog = () => {
    onClose();
  };

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

  const triggers: WorkflowYmlObject['triggers'] = useMemo(() => {
    const decoratedTriggers: WorkflowYmlObject['triggers'] = deepCloneSimpleObject(workflow?.userValues.triggers) || {};
    decoratedTriggers.push = decoratedTriggers.push?.map((trigger: any) => ({ ...trigger, id: crypto.randomUUID() }));
    decoratedTriggers.pull_request = decoratedTriggers.pull_request?.map((trigger: any) => ({
      ...trigger,
      id: crypto.randomUUID(),
    }));
    decoratedTriggers.tag = decoratedTriggers.tag?.map((trigger: any) => ({ ...trigger, id: crypto.randomUUID() }));
    return decoratedTriggers;
  }, [workflow?.userValues.triggers]);

  const onTriggerDelete = (id: string, type: SourceType) => {
    triggers[type] = triggers[type]?.filter((t: any) => t.id !== id);
    updateWorkflowTriggers(workflow?.id || '', triggers);
  };

  return (
    <TabPanel id={WorkflowConfigTab.TRIGGERS}>
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
      <ExpandableCard padding="0" buttonContent={<Text textStyle="body/lg/semibold">Push triggers</Text>}>
        {triggers?.push?.map((trigger: any) => (
          <TriggerItem key={trigger.id} onDeleteClick={() => onTriggerDelete(trigger.id, 'push')} trigger={trigger} />
        ))}
        <Button margin="24" size="md" variant="secondary" onClick={onOpen} leftIconName="PlusAdd">
          Add push trigger
        </Button>
      </ExpandableCard>
      <ExpandableCard
        padding="0"
        buttonContent={<Text textStyle="body/lg/semibold">Pull request triggers</Text>}
        marginY="12"
      >
        {triggers?.pull_request?.map((trigger: any) => (
          <TriggerItem
            key={trigger.id}
            onDeleteClick={() => onTriggerDelete(trigger.id, 'pull_request')}
            trigger={trigger}
          />
        ))}
        <Button margin="24" size="md" variant="secondary" onClick={onOpen} leftIconName="PlusAdd">
          Add pull request trigger
        </Button>
      </ExpandableCard>
      <ExpandableCard padding="0" buttonContent={<Text textStyle="body/lg/semibold">Tag triggers</Text>}>
        {triggers?.tag?.map((trigger: any) => (
          <TriggerItem key={trigger.id} onDeleteClick={() => onTriggerDelete(trigger.id, 'tag')} trigger={trigger} />
        ))}
        <Button margin="24" size="md" variant="secondary" onClick={onOpen} leftIconName="PlusAdd">
          Add tag trigger
        </Button>
      </ExpandableCard>
      <AddTriggerDialog onClose={onCloseDialog} isOpen={isOpen} />
    </TabPanel>
  );
};

export default TriggersTabPanel;
