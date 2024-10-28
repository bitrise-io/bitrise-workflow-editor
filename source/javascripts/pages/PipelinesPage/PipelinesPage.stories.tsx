import { Meta, StoryObj } from '@storybook/react';
import { Box } from '@bitrise/bitkit';
import PipelinesPage from './PipelinesPage';

export default {
  component: PipelinesPage,
  args: {
    yml: TEST_BITRISE_YML,
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
} as Meta<typeof PipelinesPage>;

type Story = StoryObj<typeof PipelinesPage>;

export const Default: Story = {};
