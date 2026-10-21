import { Text } from '@bitrise/bitkit';
import { IconPlus } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { NodeProps } from '@xyflow/react';
import { useMemo } from 'react';

import { WORKFLOW_NODE_HEIGHT, WORKFLOW_NODE_WIDTH } from '../GraphPipelineCanvas.const';
import { LeftHandle } from './Handles';

type Props = NodeProps;

// The Workflow this connection would add, projected onto the canvas: a see-through card whose dashed
// outline slowly runs around its edge. CSS can't animate a dashed border, so the outline is an SVG rect.
const PlaceholderNode = ({ zIndex }: Props) => {
  // Respect the system's reduced-motion setting: the dashes then stay still.
  const isMotionReduced = useMemo(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches, []);

  return (
    <Box display="flex" alignItems="stretch" height={WORKFLOW_NODE_HEIGHT} width={WORKFLOW_NODE_WIDTH} zIndex={zIndex}>
      <LeftHandle />
      <Box
        gap="8"
        flex="1"
        display="flex"
        position="relative"
        borderRadius="8"
        alignItems="center"
        justifyContent="center"
        // Mostly white, so the canvas dots show through softly.
        backgroundColor="color-mix(in srgb, var(--colors-background-primary) 60%, transparent)"
      >
        <Box as="svg" position="absolute" inset="0" width="100%" height="100%" overflow="visible" aria-hidden>
          <rect
            x="0.5"
            y="0.5"
            rx="8"
            style={{ width: 'calc(100% - 1px)', height: 'calc(100% - 1px)' }}
            fill="none"
            stroke="var(--colors-border-hover)"
            strokeWidth="1"
            strokeDasharray="6 4"
          >
            {!isMotionReduced && (
              <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="1.6s" repeatCount="indefinite" />
            )}
          </rect>
        </Box>
        <IconPlus size="16" color="icon/tertiary" />
        <Text color="text/tertiary" textStyle="body/md/regular">
          Workflow
        </Text>
      </Box>
      <Box width="16" />
    </Box>
  );
};

export default PlaceholderNode;
