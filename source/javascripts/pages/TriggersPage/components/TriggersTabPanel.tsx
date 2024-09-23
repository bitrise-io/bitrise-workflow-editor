import { Button, ExpandableCard, Link, Notification, TabPanel, Text, useDisclosure } from '@bitrise/bitkit';
import { useUserMetaData } from '../../../hooks/useUserMetaData';
import { WorkflowConfigTab } from '../../../components/unified-editor/WorkflowConfig/WorkflowConfig.types';
import RuntimeUtils from '../../../core/utils/RuntimeUtils';
import AddTriggerDialog from './AddTriggerDialog';

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
      <AddTriggerDialog onClose={onCloseDialog} isOpen={isOpen} />
    </TabPanel>
  );
};

export default TriggersTabPanel;
