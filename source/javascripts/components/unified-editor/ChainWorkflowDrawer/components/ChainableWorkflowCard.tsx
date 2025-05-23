import { Box, Button, ButtonGroup, Card, Divider, Text } from '@bitrise/bitkit';

import WorkflowService from '@/core/services/WorkflowService';
import useDependantWorkflows from '@/hooks/useDependantWorkflows';

import type { ChainWorkflowCallback } from '../ChainWorkflowDrawer';

type Props = {
  chainableWorkflowId: string;
  parentWorkflowId: string;
  onChainWorkflow: ChainWorkflowCallback;
};

const ChainableWorkflowCard = ({ chainableWorkflowId, parentWorkflowId, onChainWorkflow }: Props) => {
  const dependants = useDependantWorkflows({ workflowId: chainableWorkflowId });
  return (
    <Card
      className="group"
      variant="outline"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      px="16"
      py="8"
      _hover={{
        backgroundColor: 'inherit',
        borderColor: 'border.strong',
        boxShadow: 'small',
      }}
    >
      <Box overflow="hidden">
        <Text textStyle="body/lg/semibold" mb="4" hasEllipsis>
          {chainableWorkflowId}
        </Text>
        <Text textStyle="body/sm/regular" color="text/secondary">
          {WorkflowService.getUsedByText(dependants)}
        </Text>
      </Box>
      <ButtonGroup flexShrink={0} display="none" _groupHover={{ display: 'inline-flex' }}>
        <Button
          variant="tertiary"
          size="sm"
          leftIconName="ArrowQuit"
          onClick={() => onChainWorkflow(parentWorkflowId, 'before_run', chainableWorkflowId)}
        >
          Add before
        </Button>
        <Divider orientation="vertical" height="32px" />
        <Button
          variant="tertiary"
          size="sm"
          leftIconName="ArrowForwardAndDown"
          onClick={() => onChainWorkflow(parentWorkflowId, 'after_run', chainableWorkflowId)}
        >
          Add after
        </Button>
      </ButtonGroup>
    </Card>
  );
};

export default ChainableWorkflowCard;
