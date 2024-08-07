import { Box, Text } from '@bitrise/bitkit';
import { useFormContext } from 'react-hook-form';
import { FormValues } from '../WorkflowConfigPanel.types';
import WorkflowUsedByText from '../../WorkflowUsedByText/WorkflowUsedByText';

const Header = () => {
  const { watch } = useFormContext<FormValues>();
  const workflowId = watch('workflowId');

  return (
    <Box px="24" py="16">
      <Text textStyle="heading/h3">{workflowId}</Text>
      <WorkflowUsedByText workflowId={workflowId} />
    </Box>
  );
};

export default Header;
