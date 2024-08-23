import { Box, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from '@bitrise/bitkit';
import useWorkflowUsedBy from '@/hooks/useWorkflowUsedBy';
import WorkflowService from '@/core/models/WorkflowService';
import { WorkflowConfigTab } from '@/components/WorkflowConfig/WorkflowConfig.types';
import PropertiesTab from '@/components/WorkflowConfig/tabs/PropertiesTab';
import ConfigurationTab from '@/components/WorkflowConfig/tabs/ConfigurationTab';
import useSelectedWorkflow from '@/hooks/useSelectedWorkflow';

const WorkflowConfigPanel = () => {
  const [{ id: selectedWorkflowId }] = useSelectedWorkflow();
  const usedBy = useWorkflowUsedBy(selectedWorkflowId);

  return (
    <Box display="flex" flexDir="column" borderLeft="1px solid" borderColor="border/regular">
      <Box px="24" py="16">
        <Text textStyle="heading/h3">{selectedWorkflowId}</Text>
        <Text textStyle="body/sm/regular" color="text/secondary">
          {WorkflowService.getUsedByText(usedBy)}
        </Text>
      </Box>
      <Tabs display="flex" flexDir="column" flex="1" minH={0}>
        <TabList px="8">
          <Tab id={WorkflowConfigTab.CONFIGURATION}>Configuration</Tab>
          <Tab id={WorkflowConfigTab.PROPERTIES}>Properties</Tab>
        </TabList>
        <TabPanels flex="1" minH="0">
          <TabPanel id={WorkflowConfigTab.CONFIGURATION} p="24" overflowY="auto" h="100%">
            <ConfigurationTab />
          </TabPanel>
          <TabPanel id={WorkflowConfigTab.PROPERTIES} p="24" overflowY="auto" h="100%">
            <PropertiesTab />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default WorkflowConfigPanel;
