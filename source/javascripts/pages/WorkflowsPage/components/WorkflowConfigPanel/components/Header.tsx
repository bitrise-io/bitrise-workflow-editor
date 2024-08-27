import { Box, Text } from '@bitrise/bitkit';
import { useFormContext } from 'react-hook-form';
import useDependantWorkflows from '@/hooks/useDependantWorkflows';
import WorkflowService from '@/core/models/WorkflowService';
import { FormValues } from '../WorkflowConfigPanel.types';

const Header = () => {
  const { watch } = useFormContext<FormValues>();
  const workflowId = watch('workflowId');
  const dependants = useDependantWorkflows(workflowId);

  return (
    <Box px="24" py="16">
      <Text textStyle="heading/h3">{workflowId}</Text>
      <Text textStyle="body/sm/regular" color="text/secondary">
        {WorkflowService.getUsedByText(dependants)}
      </Text>
    </Box>
  );
};

export default Header;
