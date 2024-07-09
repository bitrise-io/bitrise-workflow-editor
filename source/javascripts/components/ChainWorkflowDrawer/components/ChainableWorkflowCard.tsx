import { Box, Button, ButtonGroup, Card, DefinitionTooltip, Divider, Text } from '@bitrise/bitkit';

const getUsedByText = (usedBy: string[]) => {
  if (usedBy.length === 0) {
    return 'Not used by other Workflow';
  }

  const text = usedBy.length === 1 ? '1 Workflow' : `${usedBy.length.toString()} Workflows`;
  return (
    <Text as="dl">
      Used by{' '}
      <Text as="dd" display="inline-block">
        <DefinitionTooltip label={usedBy.join(', ')}>{text}</DefinitionTooltip>
      </Text>
    </Text>
  );
};

type Props = {
  workflowId: string;
  usedBy: string[];
  onChainBefore: (workflowId: string) => void;
  onChainAfter: (workflowId: string) => void;
};

const ChainableWorkflowCard = ({ workflowId, usedBy, onChainBefore, onChainAfter }: Props) => {
  return (
    <Card variant="outline" display="flex" alignItems="center" justifyContent="space-between" px="16" py="8">
      <Box overflow="hidden">
        <Text textStyle="body/lg/semibold" mb="4" hasEllipsis>
          {workflowId}
        </Text>
        <Text textStyle="body/sm/regular" color="text/secondary" hasEllipsis>
          {getUsedByText(usedBy)}
        </Text>
      </Box>
      <ButtonGroup flexShrink={0}>
        <Button variant="tertiary" size="sm" leftIconName="ArrowQuit" onClick={() => onChainBefore(workflowId)}>
          Add before
        </Button>
        <Divider orientation="vertical" height="32px" />
        <Button variant="tertiary" size="sm" leftIconName="ArrowQuit" onClick={() => onChainAfter(workflowId)}>
          Add after
        </Button>
      </ButtonGroup>
    </Card>
  );
};

export default ChainableWorkflowCard;
