import { Meta, StoryObj } from '@storybook/react';
import { getStacksAndMachines } from '@/core/api/StacksAndMachinesApi.mswMocks';
import StacksAndMachinesPage from './StacksAndMachinesPage';

type Story = StoryObj<typeof StacksAndMachinesPage>;

const meta: Meta<typeof StacksAndMachinesPage> = {
  component: StacksAndMachinesPage,
  args: {
    yml: TEST_BITRISE_YML,
  },
  argTypes: {
    onChange: { type: 'function' },
  },
  parameters: {
    layout: 'fullscreen',
    msw: [getStacksAndMachines()],
  },
};

export const Default: Story = {};

export default meta;
