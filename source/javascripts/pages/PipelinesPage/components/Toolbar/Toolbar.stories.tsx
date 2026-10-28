import { Meta, StoryObj } from '@storybook/react-vite';

import Toolbar, { PipelineActionsProvider } from './Toolbar';

type Story = StoryObj<typeof Toolbar>;

const meta: Meta<typeof Toolbar> = {
  component: Toolbar,
  decorators: [
    (Story) => (
      <PipelineActionsProvider>
        <Story />
      </PipelineActionsProvider>
    ),
  ],
};

export const Default: Story = {};

export default meta;
