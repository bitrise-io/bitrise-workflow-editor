import { Box, Tab, TabList, Text } from '@bitrise/bitkit';

import WorkflowService from '@/core/services/WorkflowService';
import useDependantWorkflows from '@/hooks/useDependantWorkflows';

import { useWorkflowConfigContext } from '../WorkflowConfig.context';

type Props = {
  variant: 'panel' | 'drawer';
  context: 'pipeline' | 'workflow';
  parentWorkflowId?: string;
};

const WorkflowConfigHeader = ({ variant, context, parentWorkflowId }: Props) => {
  const { id = '', userValues } = useWorkflowConfigContext() ?? {};

  const dependants = useDependantWorkflows({ workflowId: id });

  const showSubTitle = context === 'workflow';
  const shouldShowTriggersTab = !parentWorkflowId && !WorkflowService.isUtilityWorkflow(id) && context === 'workflow';

  return (
    <>
      <Box p={variant === 'panel' ? '16px 24px 0px 24px' : '0'}>
        <Text as="h3" textStyle="heading/h3">
          {userValues?.title || id || 'Workflow'}
        </Text>
        {showSubTitle && (
          <Text textStyle="body/sm/regular" color="text/secondary">
            {WorkflowService.getUsedByText(dependants)}
          </Text>
        )}
      </Box>
      <TabList paddingX="8" mx={variant === 'drawer' ? '-24' : '0'} mt="16">
        <Tab>Configuration</Tab>
        <Tab>Properties</Tab>
        {shouldShowTriggersTab && <Tab>Triggers</Tab>}
      </TabList>
    </>
  );
};

export default WorkflowConfigHeader;
