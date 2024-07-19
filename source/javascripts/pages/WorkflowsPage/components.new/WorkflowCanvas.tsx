import { Box, BoxProps, Card } from '@bitrise/bitkit';

type Props = BoxProps;

const WorkflowCanvas = (props: Props) => {
  return (
    <Box p="16" {...props}>
      <Card mx="auto" w={400} h={2048} display="flex" alignItems="center" justifyContent="center">
        fake-selected-workflow
      </Card>
    </Box>
  );
};

export default WorkflowCanvas;
