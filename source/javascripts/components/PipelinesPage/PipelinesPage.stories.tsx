import { Meta, StoryObj } from '@storybook/react';
import { Box } from '@bitrise/bitkit';
import PipelinesPage from './PipelinesPage';
import { mockYml } from './PipelinesPage.mocks';

export default {
  component: PipelinesPage,
  args: {
    yml: mockYml,
  },
  argTypes: {
    yml: {
      type: 'symbol',
    },
    selectedPipeline: {
      type: 'string',
    },
    onSelectPipeline: {
      type: 'function',
    },
  },
  parameters: {
    layout: 'fullscreen',
    actions: { argTypesRegex: '^on.*' },
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
