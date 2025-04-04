import { Meta, StoryObj } from '@storybook/react';
import { set } from 'es-toolkit/compat';
import { getStacksAndMachines } from '@/core/api/StacksAndMachinesApi.mswMocks';
import StacksAndMachinesPage from './StacksAndMachinesPage';

type Story = StoryObj<typeof StacksAndMachinesPage>;
/*
  args: {
    yml: set(TEST_BITRISE_YML, 'pipelines["graph-pipeline"].workflows.override', {
      uses: 'wf3',
      depends_on: ['wf1'],
    }),
  },
*/

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

export default meta;
