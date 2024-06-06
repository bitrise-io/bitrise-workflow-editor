import { Box, Text } from '@bitrise/bitkit';
import { useFormContext } from 'react-hook-form';
import { FormValues } from '../WorkflowConfigPanel.types';

const Header = () => {
  const { watch, getValues } = useFormContext<FormValues>();

  const title = watch('properties.title');
  const workflowId = getValues('workflowId');

  return (
    <Box px="24" py="16">
      <Text textStyle="heading/h3">{title || workflowId}</Text>
    </Box>
  );
};

export default Header;
