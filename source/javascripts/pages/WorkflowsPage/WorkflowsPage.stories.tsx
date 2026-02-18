import { Box } from '@bitrise/bitkit';
import { Meta, StoryObj } from '@storybook/react-vite';
import { set } from 'es-toolkit/compat';
import { stringify } from 'yaml';

import {
  getCertificates,
  getDefaultOutputs,
  getFileStorageDocuments,
  getProvProfiles,
} from '@/core/api/EnvVarsApi.mswMocks';
import { getSecrets, getSecretsFromLocal } from '@/core/api/SecretApi.mswMocks';
import { getStacksAndMachines } from '@/core/api/StacksAndMachinesApi.mswMocks';
import StepApiMocks from '@/core/api/StepApi.mswMocks';
import YmlUtils from '@/core/utils/YmlUtils';

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
    window.env.MODE = 'CLI';
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
  beforeEach: () => {
    set(window, 'parent.globalProps.featureFlags.account.enable-wfe-step-bundles-when-to-run', true);
  },
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

export const DedicatedWithMachines: Story = {
  parameters: {
    msw: { handlers: [getStacksAndMachines({ privateCloud: 'machine-overrides' })] },
  },
};

export const LegacyDedicated: Story = {
  parameters: {
    msw: { handlers: [getStacksAndMachines({ privateCloud: 'no-machines' })] },
  },
};

export const SelfHostedRunner: Story = {
  parameters: {
    msw: { handlers: [getStacksAndMachines({ hasSelfHostedRunner: true })] },
  },
};

export const NoContainerDefinitions: Story = {
  parameters: {
    bitriseYmlStore: (() => {
      const yml = set(TEST_BITRISE_YML, 'containers', {});
      return { yml, ymlDocument: YmlUtils.toDoc(stringify(yml)) };
    })(),
  },
};

export const WithContainerDefinitions: Story = {
  parameters: {
    bitriseYmlStore: (() => {
      set(TEST_BITRISE_YML, 'containers', {
        golang: {
          type: 'execution',
          image: 'golang:1.22',
        },
        redis: {
          type: 'service',
          image: 'redis:latest',
          ports: ['6379:6379'],
          options: '--health-cmd "redis-cli ping" --health-interval 10s --health-timeout 5s --health-retries 5',
        },
        mongodb: {
          type: 'service',
          image: 'mongo:7',
          ports: ['27017:27017'],
          env: ['MONGO_INITDB_ROOT_USERNAME=admin', 'MONGO_INITDB_ROOT_PASSWORD=password'],
          options:
            '--health-cmd "mongosh --eval \'db.adminCommand({ping:1})\'" --health-interval 10s --health-timeout 5s --health-retries 5',
        },
      });
      return { yml: TEST_BITRISE_YML, ymlDocument: YmlUtils.toDoc(stringify(TEST_BITRISE_YML)) };
    })(),
  },
};

export default meta;
