import { BitkitTooltip, rem } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { Text } from '@chakra-ui/react/text';
import { NodeProps } from '@xyflow/react';

import { WORKFLOW_NODE_HEIGHT, WORKFLOW_NODE_WIDTH } from '../GraphPipelineCanvas.const';
import { LeftHandle } from './Handles';

const TOOLTIP_LABEL = 'The upstream step will append workflows here when the pipeline runs.';

const GeneratedWorkflowsPlaceholderNode = ({ zIndex }: NodeProps) => {
  return (
    <Box display="flex" alignItems="stretch" height={WORKFLOW_NODE_HEIGHT} width={WORKFLOW_NODE_WIDTH} zIndex={zIndex}>
      <LeftHandle />
      <BitkitTooltip text={TOOLTIP_LABEL}>
        <Box
          flex="1"
          minWidth="0"
          minHeight={WORKFLOW_NODE_HEIGHT}
          display="flex"
          alignItems="center"
          paddingInlineStart={rem(42)}
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
            <Text textStyle="body/md/semibold" color="text/secondary" truncate maxWidth="full">
              Dynamic workflows
            </Text>
            <Text textStyle="body/sm/regular" color="text/tertiary" truncate maxWidth="full">
              Appended at runtime
            </Text>
          </Box>
        </Box>
      </BitkitTooltip>
      <Box width="16" />
    </Box>
  );
};

export default GeneratedWorkflowsPlaceholderNode;
