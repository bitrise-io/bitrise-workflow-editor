import { Box, Tab, TabList, Text } from '@bitrise/bitkit';
import WorkflowService from '@/core/models/WorkflowService';
import useDependantWorkflows from '@/hooks/useDependantWorkflows';
import { useWorkflowConfigContext } from '../WorkflowConfig.context';

type Props = {
  variant: 'panel' | 'drawer';
  context: 'pipeline' | 'workflow';
};

const WorkflowConfigHeader = ({ variant, context }: Props) => {
  const { id = '', userValues } = useWorkflowConfigContext() ?? {};

  const dependants = useDependantWorkflows({ workflowId: id });

  const showSubTitle = context === 'workflow';
  const shouldShowTriggersTab = variant === 'panel' && !WorkflowService.isUtilityWorkflow(id);

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        px={variant === 'panel' ? '24' : '0'}
        py={variant === 'panel' ? '16' : '0'}
      >
        <Box>
          <Text as="h3" textStyle="heading/h3">
            {userValues?.title || id || 'Workflow'}
          </Text>
          <Text textStyle="body/sm/regular" color="text/secondary">
            {showSubTitle && WorkflowService.getUsedByText(dependants)}
          </Text>
        </Box>
      </Box>
      <Box mx={variant === 'drawer' ? '-24' : '0'} mt="16">
        <TabList position="relative" paddingX="8">
          <Tab>Configuration</Tab>
          <Tab>Properties</Tab>
          {shouldShowTriggersTab && <Tab>Triggers</Tab>}
        </TabList>
      </Box>
    </>
  );
};

export default WorkflowConfigHeader;
