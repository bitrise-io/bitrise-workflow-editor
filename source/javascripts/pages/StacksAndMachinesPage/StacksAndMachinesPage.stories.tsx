import { Meta, StoryObj } from '@storybook/react';
import { set } from 'es-toolkit/compat';
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
    msw: {
      handlers: {
        story: [getStacksAndMachines({ hasSelfHostedRunner: true })],
      },
    },
  },
  beforeEach: () => {
    set(window, 'parent.pageProps.project.isOwnerPaying', true);
  },
};

export const PayingUser: Story = {};

export const FreeUser: Story = {
  beforeEach: () => {
    set(window, 'parent.pageProps.project.isOwnerPaying', false);
  },
};

export const WithInvalidPreviousStackVersion: Story = {
  args: {
    yml: set(TEST_BITRISE_YML, 'meta["bitrise.io"]', {
      stack: 'osx-xcode-15',
      machine_type_id: 'm2.large',
      stack_rollback_version: '1.0.0',
    }),
  },
};

export default meta;
