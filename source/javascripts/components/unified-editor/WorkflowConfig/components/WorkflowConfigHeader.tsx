import { Box, IconButton, Tab, TabList, Text } from '@bitrise/bitkit';
import WorkflowService from '@/core/models/WorkflowService';
import useDependantWorkflows from '@/hooks/useDependantWorkflows';
import { useWorkflowsPageStore } from '@/pages/WorkflowsPage/WorkflowsPage.store';
import useFeatureFlag from '@/hooks/useFeatureFlag';
import { useWorkflowConfigContext } from '../WorkflowConfig.context';

type Props = {
  variant: 'panel' | 'drawer';
};

const WorkflowConfigHeader = ({ variant }: Props) => {
  const { id, userValues } = useWorkflowConfigContext() ?? { id: '' };
  const dependants = useDependantWorkflows(id);
  const { openDeleteWorkflowDialog } = useWorkflowsPageStore();
  const isTargetBasedTriggersEnabled = useFeatureFlag('enable-target-based-triggers');

  const shouldShowDeleteButton = variant === 'panel';
  const shouldShowTriggersTab = variant === 'panel' && isTargetBasedTriggersEnabled;

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
      <TabList paddingX="8" position="relative" mt="8">
        <Tab>Configuration</Tab>
        <Tab>Properties</Tab>
        {shouldShowTriggersTab && <Tab>Triggers</Tab>}
      </TabList>
    </>
  );
};

export default WorkflowConfigHeader;
