import { useState } from 'react';

import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  UseDisclosureProps,
} from '@chakra-ui/react';
import { Icon, TabPanel, TabPanels, Tabs, useDisclosure, useToast } from '@bitrise/bitkit';
import { useFormContext } from 'react-hook-form';
import { useShallow } from 'zustand/react/shallow';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import WorkflowConfigProvider from './WorkflowConfig.context';
import ConfigurationTab from './tabs/ConfigurationTab';
import PropertiesTab from './tabs/PropertiesTab';
import WorkflowConfigHeader from './components/WorkflowConfigHeader';
import { FormValues, WorkflowConfigTab } from './WorkflowConfig.types';

type Props = UseDisclosureProps & { workflowId: string };

const WorkflowConfigDrawerContent = (props: UseDisclosureProps) => {
  const toast = useToast();
  const { isOpen, onClose } = useDisclosure(props);
  const [selectedTab, setSelectedTab] = useState<string | undefined>(WorkflowConfigTab.CONFIGURATION);

  const form = useFormContext<FormValues>();

  const defaultWorkflowId = form.formState.defaultValues?.properties?.name ?? '';

  const { renameWorkflow, updateWorkflow, updateStackAndMachine, updateWorkflowEnvVars } = useBitriseYmlStore(
    useShallow((s) => ({
      renameWorkflow: s.renameWorkflow,
      updateWorkflow: s.updateWorkflow,
      updateStackAndMachine: s.updateStackAndMachine,
      updateWorkflowEnvVars: s.updateWorkflowEnvVars,
    })),
  );

  const saveAndClose = form.handleSubmit(
    ({ properties: { name, ...properties }, configuration: { stackId, machineTypeId, envs } }) => {
      updateStackAndMachine(defaultWorkflowId, stackId, machineTypeId);
      updateWorkflowEnvVars(defaultWorkflowId, envs);
      updateWorkflow(defaultWorkflowId, properties);
      renameWorkflow(defaultWorkflowId, name);
      onClose();
    },
  );

  const handleClose = () => {
    form.trigger().then((isValid) => {
      if (!isValid) {
        toast({
          status: 'error',
          title: 'Invalid Workflow configuration',
          description: 'Please check the configuration and try again.',
          isClosable: true,
        });
        return;
      }

      saveAndClose();
    });
  };

  const handleCloseComplete = () => {
    setSelectedTab(WorkflowConfigTab.CONFIGURATION);
    form.reset();
  };

  return (
    <Tabs tabId={selectedTab} onChange={(_, tabId) => setSelectedTab(tabId)}>
      <Drawer
        isFullHeight
        isOpen={isOpen}
        onClose={handleClose}
        autoFocus={false}
        onCloseComplete={handleCloseComplete}
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
          margin={[0, 24]}
          overflow="hidden"
          boxShadow="large"
          borderRadius={[0, 12]}
          maxWidth={['100%', '50%']}
        >
          <DrawerCloseButton size="md">
            <Icon name="Cross" />
          </DrawerCloseButton>

          <DrawerHeader color="initial" textTransform="initial" fontWeight="initial">
            <WorkflowConfigHeader variant="drawer" />
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
