import { Box, Tab, TabList, Text } from '@bitrise/bitkit';
import { useWorkflowConfigContext } from '../WorkflowConfig.context';
import useWorkflowUsedBy from '../hooks/useWorkflowUsedBy';
import { WorkflowConfigTab } from '../WorkflowConfig.types';

const getUsedByText = (usedBy: string[]) => {
  switch (usedBy.length) {
    case 0:
      return 'Not used by other Workflow';
    case 1:
      return 'Used by 1 Workflow';
    default:
      return `Used by ${usedBy.length.toString()} Workflows`;
  }
};

const WorkflowConfigHeader = () => {
  const result = useWorkflowConfigContext();
  const dependants = useWorkflowUsedBy(result?.id || '');

  return (
    <>
      <Box px="24" py="16">
        <Text as="h3" textStyle="heading/h3">
          {result?.userValues.title || result?.id || 'Workflow'}
        </Text>
        <Text textStyle="body/sm/regular" color="text/secondary">
          {getUsedByText(dependants)}
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
