import { Box, Card, Text } from '@bitrise/bitkit';

import TabContainer from '@/components/tabs/TabContainer';
import WorkflowStackAndMachine from '@/components/StacksAndMachine/WorkflowStackAndMachine';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

const WorkflowsTab = () => {
  const workflowIds = useBitriseYmlStore((state) => Object.keys(state.yml.workflows ?? {}));

  return (
    <TabContainer>
      {workflowIds.map((workflowId) => (
        <Box>
          <Text as="h4" textStyle="heading/h4" mb="12">
            {workflowId}
          </Text>
          <Card>
            <WorkflowStackAndMachine key={workflowId} workflowId={workflowId} />
          </Card>
        </Box>
      ))}
    </TabContainer>
  );
};

export default WorkflowsTab;
