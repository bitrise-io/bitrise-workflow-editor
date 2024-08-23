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
import { useFormContext } from 'react-hook-form';
import { useShallow } from 'zustand/react/shallow';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import WorkflowConfigProvider from './WorkflowConfig.context';
import ConfigurationTab from './tabs/ConfigurationTab';
import PropertiesTab from './tabs/PropertiesTab';
import WorkflowConfigHeader from './components/WorkflowConfigHeader';
import { FormValues, WorkflowConfigTab } from './WorkflowConfig.types';
import useLockFormReset from './hooks/useLockFormReset';

type Props = UseDisclosureProps & { workflowId: string };

const WorkflowConfigDrawerContent = ({ workflowId, ...props }: Props) => {
  useLockFormReset(false);

  const form = useFormContext<FormValues>();
  const { isOpen, onClose } = useDisclosure(props);
  const [selectedTab, setSelectedTab] = useState<string | undefined>(WorkflowConfigTab.CONFIGURATION);

  const renameWorkflow = useBitriseYmlStore(useShallow((s) => s.renameWorkflow));
  const updateWorkflow = useBitriseYmlStore(useShallow((s) => s.updateWorkflow));

  const handleSubmit = form.handleSubmit(({ properties: { name, ...properties } }) => {
    updateWorkflow(workflowId, properties);
    renameWorkflow(workflowId, name);
    onClose();
  });

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
              <Button type="submit" isDisabled={!form.formState.isDirty} onClick={handleSubmit}>
                Done
              </Button>
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
      <WorkflowConfigDrawerContent workflowId={workflowId} {...props} />
    </WorkflowConfigProvider>
  );
};

export default WorkflowConfigDrawer;