import { Box } from '@chakra-ui/react/box';
import { Meta, StoryObj } from '@storybook/react-vite';

import StepBundlesPage from './StepBundlesPage';

export default {
  component: StepBundlesPage,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: (Story) => (
    <Box height="100dvh">
      <Story />
    </Box>
  ),
} as Meta<typeof StepBundlesPage>;

type Story = StoryObj<typeof StepBundlesPage>;

export const Default: Story = {};
