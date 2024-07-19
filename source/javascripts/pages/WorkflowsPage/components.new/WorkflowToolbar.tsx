import { Box, BoxProps, Dropdown, DropdownOption, IconButton } from '@bitrise/bitkit';

type Props = BoxProps;

const WorkflowToolbar = (props: Props) => {
  return (
    <Box p="12" display="flex" gap="12" bg="background/primary" {...props}>
      <Dropdown flex="1" size="md" defaultValue="fake-selected-workflow">
        <DropdownOption value="fake-selected-workflow">fake-selected-workflow</DropdownOption>
      </Dropdown>
      <IconButton iconName="MoreVertical" aria-label="Manage Workflows" size="md" variant="secondary" />
      <IconButton iconName="Play" aria-label="Run Workflow" size="md" variant="secondary" />
    </Box>
  );
};

export default WorkflowToolbar;
