import { Meta, StoryObj } from '@storybook/react-vite';

import { getStacksAndMachines } from '@/core/api/StacksAndMachinesApi.mswMocks';

import WorkflowSelectorDrawer from './WorkflowSelectorDrawer';

type Story = StoryObj<typeof WorkflowSelectorDrawer>;

const meta: Meta<typeof WorkflowSelectorDrawer> = {
  component: WorkflowSelectorDrawer,
  args: {
    isOpen: true,
    pipelineId: 'graph-pipeline',
  },
  argTypes: {
    onClose: { type: 'function' },
    onSelectWorkflow: { type: 'function' },
  },
  parameters: {
    msw: {
      handlers: [getStacksAndMachines()],
    },
  },
};

export const Default: Story = {};

export const WithoutWorkflows: Story = {
  parameters: {
    bitriseYmlStore: {
      yml: { ...TEST_BITRISE_YML, workflows: {} },
    },
  },
};

export default meta;
