import { Box } from '@bitrise/bitkit';
import { Meta, StoryObj } from '@storybook/react';

import {
  getCertificates,
  getDefaultOutputs,
  getFileStorageDocuments,
  getProvProfiles,
} from '@/core/api/EnvVarsApi.mswMocks';
import { getSecrets, getSecretsFromLocal } from '@/core/api/SecretApi.mswMocks';
import { getStacksAndMachines } from '@/core/api/StacksAndMachinesApi.mswMocks';
import StepApiMocks from '@/core/api/StepApi.mswMocks';

import WorkflowsPage from './WorkflowsPage';

type Story = StoryObj<typeof WorkflowsPage>;

const meta: Meta<typeof WorkflowsPage> = {
  component: WorkflowsPage,
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [
        StepApiMocks.getLocalStep({ status: 'success' }),
        getCertificates(),
        getProvProfiles(),
        getStacksAndMachines(),
        getFileStorageDocuments(),
        getDefaultOutputs(':appSlug'),
      ],
    },
  },
  decorators: (Story) => (
    <Box h="100dvh">
      <Story />
    </Box>
  ),
};

const cliStory: Story = {
  beforeEach: () => {
    process.env.MODE = 'cli';
    window.parent.pageProps = undefined;
    window.parent.globalProps = undefined;
  },
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [
        StepApiMocks.getLocalStep({ status: 'success' }),
        getSecretsFromLocal(),
        getDefaultOutputs(),
        getStacksAndMachines(),
      ],
    },
  },
};

export const CliMode: Story = {
  ...cliStory,
};

export const WebsiteMode: Story = {
  parameters: {
    msw: {
      handlers: [
        StepApiMocks.getLocalStep({ status: 'success' }),
        getSecrets(),
        getDefaultOutputs(),
        getStacksAndMachines(),
      ],
    },
  },
};

export const UniqueStepLimit: Story = {
  beforeEach: () => {
    window.parent.pageProps = {
      ...window.parent.pageProps,
      limits: { uniqueStepLimit: 17 },
    };
  },
};

export const DedicatedMachine: Story = {
  parameters: {
    msw: { handlers: [getStacksAndMachines({ hasDedicatedMachine: true })] },
  },
};

export const SelfHostedRunner: Story = {
  parameters: {
    msw: { handlers: [getStacksAndMachines({ hasSelfHostedRunner: true })] },
  },
};

export default meta;
