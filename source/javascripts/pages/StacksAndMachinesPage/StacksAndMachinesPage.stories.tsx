import { Meta, StoryObj } from '@storybook/react';
import { set } from 'es-toolkit/compat';
import { getStacksAndMachines } from '@/core/api/StacksAndMachinesApi.mswMocks';
import StacksAndMachinesPage, { StacksAndMachinesPageProps } from './StacksAndMachinesPage';

type Props = StacksAndMachinesPageProps & { deprecatedMachinesPeriod?: 'before' | 'in' | 'after' };

const getGracePeriod = (deprecatedMachinesPeriod: Props['deprecatedMachinesPeriod']) => {
  let shiftDays = 1;

  if (deprecatedMachinesPeriod === 'before') {
    shiftDays = 7;
  }
  if (deprecatedMachinesPeriod === 'after') {
    shiftDays = -7;
  }

  const oneDay = 86400000; // 24 hours in milliseconds
  const actualTs = Date.now() + oneDay * shiftDays;
  const gracePeriodStartedAt = new Date(actualTs - oneDay * 3).toISOString().split('T')[0];
  const gracePeriodEndedAt = new Date(actualTs + oneDay * 3).toISOString().split('T')[0];
  return {
    gracePeriodStartedAt,
    gracePeriodEndedAt,
  };
};

type Story = StoryObj<Props>;

const meta: Meta<Props> = {
  component: StacksAndMachinesPage,
  args: {
    yml: TEST_BITRISE_YML,
  },
  argTypes: {
    deprecatedMachinesPeriod: {
      control: 'inline-radio',
      options: ['before', 'in', 'after'],
    },
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

export const WithDeprecatedMachines: Story = {
  args: {
    deprecatedMachinesPeriod: 'in',
    yml: set(TEST_BITRISE_YML, 'meta["bitrise.io"]', {
      stack: 'linux-ubuntu-22.04',
      machine_type_id: 'standard',
    }),
  },
  beforeEach: ({ args }) => {
    set(
      window,
      'parent.pageProps.project.deprecatedMachinesReplacementConfig',
      getGracePeriod(args.deprecatedMachinesPeriod || 'in'),
    );
  },
};

export default meta;
