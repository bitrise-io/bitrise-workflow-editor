import { Meta, StoryObj } from '@storybook/react-vite';

import PipelineConfigDrawer from './PipelineConfigDrawer';

type Story = StoryObj<typeof PipelineConfigDrawer>;

const meta: Meta<typeof PipelineConfigDrawer> = {
  component: PipelineConfigDrawer,
  args: {
    isOpen: true,
    pipelineId: 'graph-pipeline',
  },
  argTypes: {
    onClose: { type: 'function' },
  },
};

export default meta;

export const Default: Story = {};
