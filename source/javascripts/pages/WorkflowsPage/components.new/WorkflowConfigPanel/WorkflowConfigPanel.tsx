import { Box, Card, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from '@bitrise/bitkit';
import useSelectedWorkflow from '../../hooks/useSelectedWorkflow';
import WorkflowUsedByText from '../WorkflowUsedByText';
import { WorkflowConfigTab } from './WorkflowConfigPanel.types';

const WorkflowConfigPanel = () => {
  const { id: selectedWorkflowId } = useSelectedWorkflow();

  return (
    <Box display="flex" flexDir="column" borderLeft="1px solid" borderColor="border/regular">
      <Box px="24" py="16">
        <Text textStyle="heading/h3">{selectedWorkflowId}</Text>
        <WorkflowUsedByText id={selectedWorkflowId} />
      </Box>
      <Tabs display="flex" flexDir="column" flex="1" minH={0}>
        <TabList px="8">
          <Tab id={WorkflowConfigTab.CONFIGURATION}>Configuration</Tab>
          <Tab id={WorkflowConfigTab.PROPERTIES}>Properties</Tab>
        </TabList>
        <TabPanels flex="1" minH="0">
          <TabPanel id={WorkflowConfigTab.CONFIGURATION} p="24" overflowY="auto" h="100%">
            <Card h={2048} variant="outline" />
          </TabPanel>
          <TabPanel id={WorkflowConfigTab.PROPERTIES} p="24" overflowY="auto" h="100%">
            <Card h={2048} variant="outline" />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default WorkflowConfigPanel;
