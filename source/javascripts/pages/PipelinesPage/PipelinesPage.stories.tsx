import { Meta, StoryObj } from '@storybook/react';
import { Box } from '@bitrise/bitkit';
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
  },
} as Meta<typeof PipelinesPage>;

type Story = StoryObj<typeof PipelinesPage>;

export const ReadOnly: Story = {};

export const CreateFirstGraphPipeline: Story = {
  args: {
    yml: { format_version: '2' },
  },
  beforeEach: () => {
    if (window.parent.globalProps) {
      window.parent.globalProps = {
        ...window.parent.globalProps,
        featureFlags: {
          user: {},
          account: { slug: 'workspace-1', 'enable-dag-pipelines': true },
        },
      };
    }
  },
};

export const CreateFirstStagedPipeline: Story = {
  args: {
    yml: { format_version: '2' },
  },
};

export const UpgradePlan: Story = {
  args: {
    yml: { format_version: '2' },
  },
  beforeEach: () => {
    if (window.parent.globalProps) {
      window.parent.globalProps = {
        ...window.parent.globalProps,
        featureFlags: {
          user: {},
          account: { slug: 'workspace-1', 'enable-dag-pipelines': true },
        },
      };
    }
    if (window.parent.pageProps) {
      window.parent.pageProps = {
        ...window.parent.pageProps,
        abilities: {
          canRunBuilds: true,
        },
        limits: {
          isPipelinesAvailable: false,
        },
      };
    }
  },
};

export const ReactivatePlan: Story = {
  beforeEach: () => {
    if (window.parent.globalProps) {
      window.parent.globalProps = {
        ...window.parent.globalProps,
        featureFlags: {
          user: {},
          account: { slug: 'workspace-1', 'enable-dag-pipelines': true },
        },
      };
    }
    if (window.parent.pageProps) {
      window.parent.pageProps = {
        ...window.parent.pageProps,
        abilities: {
          canRunBuilds: true,
        },
        limits: {
          isPipelinesAvailable: false,
        },
      };
    }
  },
};

export const GraphPipelineWithEditing: Story = {
  beforeEach: () => {
    if (window.parent.globalProps) {
      window.parent.globalProps = {
        ...window.parent.globalProps,
        featureFlags: {
          user: {},
          account: { slug: 'workspace-1', 'enable-dag-pipelines': true },
        },
      };
    }
  },
};
