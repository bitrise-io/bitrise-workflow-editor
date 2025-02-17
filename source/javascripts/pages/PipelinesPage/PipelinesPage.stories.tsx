import { Box } from '@bitrise/bitkit';
import { set } from 'es-toolkit/compat';
import { Meta, StoryObj } from '@storybook/react';

import PipelinesPage from './PipelinesPage';

export default {
  component: PipelinesPage,
  args: {
    yml: TEST_BITRISE_YML,
  },
  argTypes: {
    onChange: {
      type: 'function',
    },
  },
  parameters: {
    layout: 'fullscreen',
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
    process.env.MODE = 'cli';
    set(window, 'parent.pageProps.limits.isPipelinesAvailable', true);
  },
} as Meta<typeof PipelinesPage>;

type Story = StoryObj<typeof PipelinesPage>;

export const CreateFirstGraphPipeline: Story = {
  args: {
    yml: { format_version: '2' },
  },
};

export const UpgradePlan: Story = {
  args: {
    yml: { format_version: '2' },
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
  args: {
    yml: set(TEST_BITRISE_YML, 'pipelines["graph-pipeline"].workflows.override', {
      uses: 'wf3',
      depends_on: ['wf1'],
    }),
  },
};

export const WithStepBundlesUI: Story = {
  beforeEach: () => {
    set(window, 'parent.globalProps.featureFlags.account["enable-wfe-step-bundles-ui"]', true);
  },
};

export const WithParallelWorkflow: Story = {
  beforeEach: () => {
    set(window, 'parent.globalProps.featureFlags.account["enable-wfe-parallel-workflow"]', true);
  },
};
