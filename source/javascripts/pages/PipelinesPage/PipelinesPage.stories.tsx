import { Box } from '@bitrise/bitkit';
import { set } from 'es-toolkit/compat';
import { Meta, StoryObj } from '@storybook/react';

import { getStacksAndMachines } from '@/core/api/StacksAndMachinesApi.mswMocks';
import PipelinesPage from './PipelinesPage';

export default {
  component: PipelinesPage,
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [getStacksAndMachines()],
    },
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
  beforeEach: () => {
    set(window, 'parent.pageProps.limits.isPipelinesAvailable', true);
  },
} as Meta<typeof PipelinesPage>;

type Story = StoryObj<typeof PipelinesPage>;

export const CreateFirstGraphPipeline: Story = {
  parameters: {
    bitriseYml: { format_version: '2' },
  },
};

export const UpgradePlan: Story = {
  parameters: {
    bitriseYml: { format_version: '2' },
  },
  beforeEach: () => {
    set(window, 'parent.pageProps.limits.isPipelinesAvailable', false);
  },
};

export const ReactivatePlan: Story = {
  beforeEach: () => {
    set(window, 'parent.pageProps.limits.isPipelinesAvailable', false);
  },
};

export const GraphPipelineWithEditing: Story = {};

export const WithWorkflowOverride: Story = {
  parameters: {
    bitriseYml: set(TEST_BITRISE_YML, 'pipelines["graph-pipeline"].workflows.override', {
      uses: 'wf3',
      depends_on: ['wf1'],
    }),
  },
};

export const WithParallelWorkflowCollision: Story = {
  parameters: {
    bitriseYml: (() => {
      const yml = TEST_BITRISE_YML;
      set(yml, 'workflows.tmp_3', {});
      set(yml, 'pipelines["graph-pipeline"].workflows.tmp_2', { uses: 'tmp' });
      return yml;
    })(),
  },
};
