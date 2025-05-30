import { Meta, StoryObj } from '@storybook/react';
import { set } from 'es-toolkit/compat';
import { parseDocument, stringify } from 'yaml';

import { getStacksAndMachines } from '@/core/api/StacksAndMachinesApi.mswMocks';

import StacksAndMachinesPage from './StacksAndMachinesPage';

const getGracePeriod = (deprecatedMachinesPeriod?: 'before' | 'in' | 'after') => {
  let shiftDays = 1;

  if (deprecatedMachinesPeriod === 'before') {
    shiftDays = 7;
  }
  if (deprecatedMachinesPeriod === 'after') {
    shiftDays = -7;
  }

  const oneDay = 86400000; // 24 hours in milliseconds
  const actualTs = Date.now() + oneDay * shiftDays;

  return {
    grace_period_started_at: new Date(actualTs - oneDay * 3).toISOString().split('T')[0],
    grace_period_ended_at: new Date(actualTs + oneDay * 3).toISOString().split('T')[0],
  };
};

type Story = StoryObj<typeof StacksAndMachinesPage>;

const meta: Meta<typeof StacksAndMachinesPage> = {
  component: StacksAndMachinesPage,
  argTypes: {
    deprecatedMachinesPeriod: {
      control: 'inline-radio',
      options: ['before', 'in', 'after'],
    },
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

export const WithInvalidStackRollbackVersion: Story = {
  parameters: {
    bitriseYmlStore: (() => {
      const yml = set(TEST_BITRISE_YML, 'meta["bitrise.io"]', {
        stack: 'osx-xcode-15',
        machine_type_id: 'm2.large',
        stack_rollback_version: '1.0.0',
      });
      return { yml, ymlDocument: parseDocument(stringify(yml), { keepSourceTokens: true }) };
    })(),
  },
};

export const WithDeprecatedMachines: Story = {
  args: {
    deprecatedMachinesPeriod: 'in',
  },
  parameters: {
    bitriseYmlStore: (() => {
      const yml = set(TEST_BITRISE_YML, 'meta["bitrise.io"]', {
        stack: 'linux-ubuntu-22.04',
        machine_type_id: 'standard',
      });
      return { yml, ymlDocument: parseDocument(stringify(yml), { keepSourceTokens: true }) };
    })(),
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  beforeEach: ({ args }: any) => {
    set(
      window,
      'parent.globalProps.account.useReplacementForDeprecatedMachines',
      getGracePeriod(args.deprecatedMachinesPeriod || 'in'),
    );
  },
};

export const WithDedicatedMachines: Story = {
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: {
        story: [getStacksAndMachines({ privateCloud: 'machine-overrides' })],
      },
    },
  },
};

export const WithLegacyDedicated: Story = {
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: {
        story: [getStacksAndMachines({ privateCloud: 'no-machines' })],
      },
    },
  },
};

export default meta;
