import { Box } from '@bitrise/bitkit';
import { Meta, StoryObj } from '@storybook/react';

import StepBundlesPage from './StepBundlesPage';

export default {
  component: StepBundlesPage,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: (Story) => (
    <Box h="100dvh">
      <Story />
    </Box>
  ),
} as Meta<typeof StepBundlesPage>;

type Story = StoryObj<typeof StepBundlesPage>;

export const Default: Story = {};
