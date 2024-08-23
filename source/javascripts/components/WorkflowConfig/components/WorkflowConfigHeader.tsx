import { Box, Tab, TabList, Text } from '@bitrise/bitkit';
import useWorkflowUsedBy from '@/hooks/useWorkflowUsedBy';
import WorkflowService from '@/core/models/WorkflowService';
import { useWorkflowConfigContext } from '../WorkflowConfig.context';
import { WorkflowConfigTab } from '../WorkflowConfig.types';

const WorkflowConfigHeader = () => {
  const { id, title } = useWorkflowConfigContext();
  const usedBy = useWorkflowUsedBy(id);

  return (
    <>
      <Box px="24" py="16">
        <Text as="h3" textStyle="heading/h3">
          {title || id}
        </Text>
        <Text textStyle="body/sm/regular" color="text/secondary">
          {WorkflowService.getUsedByText(usedBy)}
        </Text>
      </Box>
      <Box position="relative" mt="8">
        <TabList paddingX="8">
          <Tab id={WorkflowConfigTab.CONFIGURATION}>Configuration</Tab>
          <Tab id={WorkflowConfigTab.PROPERTIES}>Properties</Tab>
        </TabList>
      </Box>
    </>
  );
};

export default WorkflowConfigHeader;
