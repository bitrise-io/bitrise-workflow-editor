import { Box, Text } from '@bitrise/bitkit';
import { useFormContext } from 'react-hook-form';
import { getUsedByText } from '@/components/WorkflowCard/WorkflowCard.utils';
import useWorkflowUsedBy from '@/hooks/useWorkflowUsedBy';
import { FormValues } from '../WorkflowConfigPanel.types';

const Header = () => {
  const { watch } = useFormContext<FormValues>();
  const workflowId = watch('workflowId');
  const usedBy = useWorkflowUsedBy(workflowId);

  return (
    <Box px="24" py="16">
      <Text textStyle="heading/h3">{workflowId}</Text>
      <Text textStyle="body/sm/regular" color="text/secondary">
        {getUsedByText(usedBy)}
      </Text>
    </Box>
  );
};

export default Header;
