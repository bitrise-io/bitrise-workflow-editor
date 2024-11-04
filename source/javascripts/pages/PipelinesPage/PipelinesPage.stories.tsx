import { Meta, StoryObj } from '@storybook/react';
import { Box } from '@bitrise/bitkit';
import PipelinesPage from './PipelinesPage';

export default {
  component: PipelinesPage,
  args: {
    yml: TEST_BITRISE_YML,
  },
  argTypes: {
    onChange: {
      type: 'function',
    },
  },
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => {
      return (
        <Box height="100dvh">
          <Story />
        </Box>
      );
    },
  ],
  beforeEach: () => {
    process.env.MODE = 'cli';
  },
} as Meta<typeof PipelinesPage>;

type Story = StoryObj<typeof PipelinesPage>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    yml: { format_version: '2' },
  },
};

export const WithEnabledDagPipelinesFeature: Story = {
  beforeEach: () => {
    if (window.parent.globalProps) {
      window.parent.globalProps = {
        ...window.parent.globalProps,
        featureFlags: { user: {}, account: { 'enable-dag-pipelines': true } },
      };
    }
  },
};

export const EmptyWithEnabledDagPipelinesFeature: Story = {
  args: {
    yml: { format_version: '2' },
  },
  beforeEach: () => {
    if (window.parent.globalProps) {
      window.parent.globalProps = {
        ...window.parent.globalProps,
        featureFlags: { user: {}, account: { 'enable-dag-pipelines': true } },
      };
    }
  },
};
