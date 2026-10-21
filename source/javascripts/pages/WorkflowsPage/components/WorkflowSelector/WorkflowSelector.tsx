import { Text } from '@chakra-ui/react/text';

import useSelectedWorkflow from '@/hooks/useSelectedWorkflow';

// The sidebar's Building blocks list picks the Workflow now; the panel only names it.
const WorkflowSelector = () => {
  const [selectedWorkflowId] = useSelectedWorkflow();

  return (
    <Text flex="1" minWidth="0" alignSelf="center" textStyle="body/lg/semibold" truncate>
      {selectedWorkflowId || 'No Workflow selected'}
    </Text>
  );
};

export default WorkflowSelector;
