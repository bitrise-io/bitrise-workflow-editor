import { Box, BoxProps } from '@bitrise/bitkit';
import WorkflowToolbar from './WorkflowToolbar';
import WorkflowCanvas from './WorkflowCanvas';

type Props = BoxProps;

const WorkflowPanel = (props: Props) => {
  return (
    <Box display="flex" flexDir="column" bg="background/secondary" {...props}>
      <WorkflowToolbar borderBottom="1px solid" borderColor="border/regular" />
      <WorkflowCanvas flex="1" overflowY="auto" />
    </Box>
  );
};

export default WorkflowPanel;
