import { Box, IconButton, Tab, TabList, Text } from '@bitrise/bitkit';
import WorkflowService from '@/core/models/WorkflowService';
import useDependantWorkflows from '@/hooks/useDependantWorkflows';
import { useWorkflowsPageStore } from '@/pages/WorkflowsPage/WorkflowsPage.store';
import { useWorkflowConfigContext } from '../WorkflowConfig.context';
import { WorkflowConfigTab } from '../WorkflowConfig.types';

type Props = {
  variant: 'panel' | 'drawer';
};

const WorkflowConfigHeader = ({ variant }: Props) => {
  const { id, userValues } = useWorkflowConfigContext() ?? { id: '' };
  const dependants = useDependantWorkflows(id);
  const { openDeleteWorkflowDialog } = useWorkflowsPageStore();

  const shouldShowDeleteButton = variant === 'panel';

  return (
    <>
      <Box px="24" py="16" display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Text as="h3" textStyle="heading/h3">
            {userValues?.title || id || 'Workflow'}
          </Text>
          <Text textStyle="body/sm/regular" color="text/secondary">
            {WorkflowService.getUsedByText(dependants)}
          </Text>
        </Box>
        {shouldShowDeleteButton && (
          <IconButton
            isDanger
            size="md"
            variant="secondary"
            iconName="Trash"
            aria-label={`Delete '${id}'`}
            tooltipProps={{ 'aria-label': `Delete '${id}'` }}
            onClick={openDeleteWorkflowDialog}
          />
        )}
      </Box>
      <Box position="relative" mt="8">
        <TabList paddingX="8">
          <Tab id={WorkflowConfigTab.CONFIGURATION}>Configuration</Tab>
          <Tab id={WorkflowConfigTab.PROPERTIES}>Properties</Tab>
          <Tab id={WorkflowConfigTab.TRIGGERS}>Triggers</Tab>
        </TabList>
      </Box>
    </>
  );
};

export default WorkflowConfigHeader;
