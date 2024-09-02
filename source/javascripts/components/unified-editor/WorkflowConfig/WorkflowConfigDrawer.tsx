import { useState } from 'react';

import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  UseDisclosureProps,
} from '@chakra-ui/react';
import { useDisclosure, Tabs, ButtonGroup, Button, TabPanels, TabPanel, Icon } from '@bitrise/bitkit';
import WorkflowConfigProvider from './WorkflowConfig.context';
import ConfigurationTab from './tabs/ConfigurationTab';
import PropertiesTab from './tabs/PropertiesTab';
import WorkflowConfigHeader from './components/WorkflowConfigHeader';
import { WorkflowConfigTab } from './WorkflowConfig.types';

type Props = UseDisclosureProps & { workflowId: string };

const WorkflowConfigDrawerContent = (props: UseDisclosureProps) => {
  const { isOpen, onClose } = useDisclosure(props);
  const [selectedTab, setSelectedTab] = useState<string | undefined>(WorkflowConfigTab.CONFIGURATION);

  return (
    <Tabs tabId={selectedTab} onChange={(_, tabId) => setSelectedTab(tabId)}>
      <Drawer
        isFullHeight
        isOpen={isOpen}
        onClose={onClose}
        autoFocus={false}
        onCloseComplete={() => setSelectedTab(WorkflowConfigTab.CONFIGURATION)}
      >
        <DrawerOverlay
          top={0}
          bg="linear-gradient(to left, rgba(0, 0, 0, 0.22) 0%, rgba(0, 0, 0, 0) 60%, rgba(0, 0, 0, 0) 100%);"
        />
        <DrawerContent
          top={0}
          gap="0"
          padding={0}
          display="flex"
          flexDir="column"
          margin={[0, 32]}
          overflow="hidden"
          boxShadow="large"
          borderRadius={[0, 12]}
          maxWidth={['100%', '50%']}
        >
          <DrawerCloseButton size="md">
            <Icon name="CloseSmall" />
          </DrawerCloseButton>

          <DrawerHeader color="initial" textTransform="initial" fontWeight="initial">
            <WorkflowConfigHeader />
          </DrawerHeader>

          <DrawerBody p="24" flex="1" overflowY="auto">
            <TabPanels>
              <TabPanel id={WorkflowConfigTab.CONFIGURATION}>
                <ConfigurationTab />
              </TabPanel>
              <TabPanel id={WorkflowConfigTab.PROPERTIES}>
                <PropertiesTab />
              </TabPanel>
            </TabPanels>
          </DrawerBody>

          <DrawerFooter p="32" boxShadow="large">
            <ButtonGroup spacing={16}>
              <Button>Done</Button>
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
            </ButtonGroup>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Tabs>
  );
};

const WorkflowConfigDrawer = ({ workflowId, ...props }: Props) => {
  return (
    <WorkflowConfigProvider workflowId={workflowId}>
      <WorkflowConfigDrawerContent {...props} />
    </WorkflowConfigProvider>
  );
};

export default WorkflowConfigDrawer;
