import { Meta, StoryObj } from '@storybook/react';
import { Box } from '@bitrise/bitkit';
import WorkflowsPage from './WorkflowsPage';
import { mockYml } from './WorkflowsPage.mocks';

type Story = StoryObj<typeof WorkflowsPage>;

const meta: Meta<typeof WorkflowsPage> = {
  component: WorkflowsPage,
  args: {
    yml: mockYml,
  },
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    onChange: {
      type: 'function',
    },
  },
  decorators: (Story) => (
    <Box h="100dvh">
      <Story />
    </Box>
  ),
};

export const CliMode: Story = {
  beforeEach: () => {
    process.env.MODE = 'cli';
  },
};

export const WebsiteMode: Story = {
  beforeEach: () => {
    process.env.MODE = 'website';
  },
};

export default meta;
