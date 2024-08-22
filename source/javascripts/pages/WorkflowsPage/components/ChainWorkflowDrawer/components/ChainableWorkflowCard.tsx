import { Box, Button, ButtonGroup, Card, Divider, Text } from '@bitrise/bitkit';
import { getUsedByText } from '@/components/WorkflowCard/WorkflowCard.utils';
import useWorkflowUsedBy from '@/hooks/useWorkflowUsedBy';
import { ChainWorkflowCallback } from '../ChainWorkflowDrawer.types';

type Props = {
  workflowId: string;
  onChainWorkflow: ChainWorkflowCallback;
};

const ChainableWorkflowCard = ({ workflowId, onChainWorkflow }: Props) => {
  const usedBy = useWorkflowUsedBy(workflowId);

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
          {workflowId}
        </Text>
        <Text textStyle="body/sm/regular" color="text/secondary">
          {getUsedByText(usedBy)}
        </Text>
      </Box>
      <ButtonGroup flexShrink={0} display="none" _groupHover={{ display: 'inline-flex' }}>
        <Button
          variant="tertiary"
          size="sm"
          leftIconName="ArrowQuit"
          onClick={() => onChainWorkflow('before', workflowId)}
        >
          Add before
        </Button>
        <Divider orientation="vertical" height="32px" />
        <Button
          variant="tertiary"
          size="sm"
          leftIconName="ArrowForwardAndDown"
          onClick={() => onChainWorkflow('after', workflowId)}
        >
          Add after
        </Button>
      </ButtonGroup>
    </Card>
  );
};

export default ChainableWorkflowCard;
