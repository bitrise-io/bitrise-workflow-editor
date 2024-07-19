import { Box, Card, Tab, TabList, TabPanels, Tabs, Text } from '@bitrise/bitkit';
import { BoxProps, TabPanel } from '@chakra-ui/react';
import { WorkflowConfigTab } from '../components/WorkflowConfigPanel/WorkflowConfigPanel.types';

type Props = BoxProps;

const WorkflowConfigPanel = (props: Props) => {
  return (
    <Box display="flex" flexDir="column" {...props}>
      <Box px="24" py="16">
        <Text textStyle="heading/h3">fake-selected-workflow</Text>
        <Text textStyle="body/sm/regular" color="text/secondary">
          Not used by other Workflow
        </Text>
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
