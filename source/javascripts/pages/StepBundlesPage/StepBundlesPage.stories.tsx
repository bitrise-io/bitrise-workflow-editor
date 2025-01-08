import { Meta, StoryObj } from '@storybook/react';
import { Box } from '@bitrise/bitkit';
import StepBundlesPage from '@/pages/StepBundlesPage/StepBundlesPage';

export default {
  component: StepBundlesPage,
  args: {
    yml: TEST_BITRISE_YML,
  },
  parameters: {
    layout: 'fullscreen',
  },
  decorators: (Story) => (
    <Box h="100dvh">
      <Story />
    </Box>
  ),
} as Meta<typeof StepBundlesPage>;

export const Default: StoryObj = {};
