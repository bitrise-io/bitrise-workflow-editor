import { Text, Tooltip } from '@bitrise/bitkit';
import { Box } from '@chakra-ui/react/box';
import { NodeProps } from '@xyflow/react';

import { WORKFLOW_NODE_HEIGHT, WORKFLOW_NODE_WIDTH } from '../GraphPipelineCanvas.const';
import { LeftHandle } from './Handles';

const TOOLTIP_LABEL = 'The upstream step will append workflows here when the pipeline runs.';

const GeneratedWorkflowsPlaceholderNode = ({ zIndex }: NodeProps) => {
  return (
    <Box display="flex" alignItems="stretch" height={WORKFLOW_NODE_HEIGHT} width={WORKFLOW_NODE_WIDTH} zIndex={zIndex}>
      <LeftHandle />
      <Tooltip label={TOOLTIP_LABEL}>
        <Box
          flex="1"
          minWidth="0"
          minHeight={WORKFLOW_NODE_HEIGHT}
          display="flex"
          alignItems="center"
          paddingInlineStart="42px"
          paddingInlineEnd="8"
          paddingBlock="6"
          borderRadius="8"
          border="1px dashed"
          borderColor="border/regular"
          backgroundColor="background/primary"
          data-testid="generated-workflows-placeholder-node"
        >
          <Box
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            justifyContent="center"
            flex="1"
            minWidth="0"
          >
            <Text textStyle="body/md/semibold" color="text/secondary" hasEllipsis>
              Dynamic workflows
            </Text>
            <Text textStyle="body/sm/regular" color="text/tertiary" hasEllipsis>
              Appended at runtime
            </Text>
          </Box>
        </Box>
      </Tooltip>
      <Box width="16" />
    </Box>
  );
};

export default GeneratedWorkflowsPlaceholderNode;
