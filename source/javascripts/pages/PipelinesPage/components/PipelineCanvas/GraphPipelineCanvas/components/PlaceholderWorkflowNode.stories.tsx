import '@xyflow/react/dist/style.css';

import { Box } from '@bitrise/bitkit';
import { Meta, StoryObj } from '@storybook/react-webpack5';
import { Node, ReactFlow } from '@xyflow/react';

import { PLACEHOLDER_NODE_TYPE } from '../GraphPipelineCanvas.const';
import PlaceholderNode from './PlaceholderWorkflowNode';

type Story = StoryObj<typeof PlaceholderNode>;

const nodeTypes = {
  placeholder: PlaceholderNode,
};

const nodes: Node[] = [
  {
    id: '1',
    data: {},
    type: PLACEHOLDER_NODE_TYPE,
    draggable: false,
    selectable: false,
    position: { x: 32, y: 32 },
  },
];

const meta: Meta<typeof PlaceholderNode> = {
  component: PlaceholderNode,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    () => (
      <Box height="100dvh" bg="background/secondary">
        <ReactFlow nodes={nodes} nodeTypes={nodeTypes} proOptions={{ hideAttribution: true }} />
      </Box>
    ),
  ],
};

export const Default: Story = {};

export default meta;
