import { Meta, StoryObj } from '@storybook/react';
import { Box } from '@bitrise/bitkit';
import { cloneDeep } from 'es-toolkit';
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
    if (window.parent.globalProps) {
      window.parent.globalProps = {
        ...window.parent.globalProps,
        featureFlags: {
          user: {},
          account: { 'enable-dag-pipelines': true },
        },
      };
    }

    if (window.parent.pageProps) {
      window.parent.pageProps = {
        ...window.parent.pageProps,
        limits: {
          isPipelinesAvailable: true,
        },
      };
    }
  },
} as Meta<typeof PipelinesPage>;

type Story = StoryObj<typeof PipelinesPage>;

export const ReadOnly: Story = {
  beforeEach: () => {
    if (window.parent.globalProps) {
      window.parent.globalProps = {
        ...window.parent.globalProps,
        featureFlags: {
          user: {},
          account: { 'enable-dag-pipelines': false },
        },
      };
    }
  },
};

export const CreateFirstGraphPipeline: Story = {
  args: {
    yml: { format_version: '2' },
  },
};

export const CreateFirstStagedPipeline: Story = {
  args: {
    yml: { format_version: '2' },
  },
  beforeEach: () => {
    if (window.parent.globalProps) {
      window.parent.globalProps = {
        ...window.parent.globalProps,
        featureFlags: {
          user: {},
          account: { 'enable-dag-pipelines': false },
        },
      };
    }
  },
};

export const UpgradePlan: Story = {
  args: {
    yml: { format_version: '2' },
  },
  beforeEach: () => {
    if (window.parent.pageProps) {
      window.parent.pageProps = {
        ...window.parent.pageProps,
        limits: {
          isPipelinesAvailable: false,
        },
      };
    }
  },
};

export const ReactivatePlan: Story = {
  beforeEach: () => {
    if (window.parent.pageProps) {
      window.parent.pageProps = {
        ...window.parent.pageProps,
        limits: {
          isPipelinesAvailable: false,
        },
      };
    }
  },
};

export const GraphPipelineWithEditing: Story = {};

const withWorkflowOverrideYml = () => {
  const yml = cloneDeep(TEST_BITRISE_YML);

  if (yml.pipelines?.['graph-pipeline']?.workflows) {
    yml.pipelines['graph-pipeline'].workflows.override = {
      uses: 'wf3',
      depends_on: ['wf1'],
    };
  }

  return yml;
};

export const WithWorkflowOverride: Story = {
  args: {
    yml: withWorkflowOverrideYml(),
  },
};
