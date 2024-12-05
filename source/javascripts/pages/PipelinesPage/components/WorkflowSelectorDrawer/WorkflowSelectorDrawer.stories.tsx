import { Meta, StoryObj } from '@storybook/react';
import { withBitriseYml } from '@/contexts/BitriseYmlProvider';
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
  decorators: [(Story) => withBitriseYml(TEST_BITRISE_YML, Story)],
};

export const Default: Story = {};

export const WithoutWorkflows: Story = {
  decorators: [(Story) => withBitriseYml({ format_version: '' }, Story)],
};

export default meta;
