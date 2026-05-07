import { Box, Text, Tooltip } from '@bitrise/bitkit';
import { NodeProps } from '@xyflow/react';

import { WORKFLOW_NODE_HEIGHT, WORKFLOW_NODE_WIDTH } from '../GraphPipelineCanvas.const';
import { LeftHandle } from './Handles';

const TOOLTIP_LABEL = 'The upstream step will append workflows here when the pipeline runs.';

const GeneratedWorkflowsPlaceholderNode = ({ zIndex }: NodeProps) => {
  return (
    <Box display="flex" alignItems="stretch" h={WORKFLOW_NODE_HEIGHT} w={WORKFLOW_NODE_WIDTH} zIndex={zIndex}>
      <LeftHandle />
      <Tooltip label={TOOLTIP_LABEL}>
        <Box
          flex="1"
          minW={0}
          minH={WORKFLOW_NODE_HEIGHT}
          display="flex"
          alignItems="center"
          pl="42"
          pr="8"
          py="6"
          borderRadius="8"
          border="1px dashed"
          borderColor="border/regular"
          backgroundColor="background/primary"
          data-testid="generated-workflows-placeholder-node"
        >
          <Box display="flex" flexDir="column" alignItems="flex-start" justifyContent="center" flex="1" minW={0}>
            <Text textStyle="body/md/semibold" color="text/secondary" hasEllipsis>
              Dynamic workflows
            </Text>
            <Text textStyle="body/sm/regular" color="text/tertiary" hasEllipsis>
              Appended at runtime
            </Text>
          </Box>
        </Box>
      </Tooltip>
      <Box w={16} />
    </Box>
  );
};

export default GeneratedWorkflowsPlaceholderNode;
