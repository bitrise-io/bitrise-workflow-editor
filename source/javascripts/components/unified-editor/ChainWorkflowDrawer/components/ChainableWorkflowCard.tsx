import { BitkitButton, IconArrowBackAndUp, IconArrowForwardAndDown } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { ButtonGroup } from '@chakra-ui/react/button';
import { Card } from '@chakra-ui/react/card';
import { Separator } from '@chakra-ui/react/separator';
import { Text } from '@chakra-ui/react/text';

import EntityModuleProvenance from '@/components/EntityModuleProvenance';
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
    <Card.Root className="group" elevation={false}>
      <Card.Body display="flex" alignItems="center" justifyContent="space-between" paddingInline="16" paddingBlock="8">
        <Box overflow="hidden">
          <Text textStyle="body/lg/semibold" marginBlockEnd="4" truncate maxWidth="full">
            {chainableWorkflowId}
          </Text>
          <Text textStyle="body/sm/regular" color="text/secondary">
            <EntityModuleProvenance
              kind="workflows"
              id={chainableWorkflowId}
              fallback={WorkflowService.getUsedByText(dependants)}
            />
          </Text>
        </Box>
        <ButtonGroup flexShrink="0" display="none" _groupHover={{ display: 'inline-flex' }}>
          <BitkitButton
            variant="tertiary"
            size="sm"
            icon={IconArrowBackAndUp}
            onClick={() => onChainWorkflow(parentWorkflowId, 'before_run', chainableWorkflowId)}
          >
            Add before
          </BitkitButton>
          <Separator orientation="vertical" height="32" />
          <BitkitButton
            variant="tertiary"
            size="sm"
            icon={IconArrowForwardAndDown}
            onClick={() => onChainWorkflow(parentWorkflowId, 'after_run', chainableWorkflowId)}
          >
            Add after
          </BitkitButton>
        </ButtonGroup>
      </Card.Body>
    </Card.Root>
  );
};

export default ChainableWorkflowCard;
