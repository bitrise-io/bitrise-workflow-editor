import { Box } from '@bitrise/bitkit';
import { Meta, StoryObj } from '@storybook/react-vite';
import { set } from 'es-toolkit/compat';
import { stringify } from 'yaml';

import { getDefaultOutputs } from '@/core/api/EnvVarsApi.mswMocks';
import {
  getCertificates,
  getFileStorageDocuments,
  getProvProfiles,
  getSecrets,
  getSecretsFromLocal,
} from '@/core/api/SecretApi.mswMocks';
import { getStacksAndMachines } from '@/core/api/StacksAndMachinesApi.mswMocks';
import StepApiMocks from '@/core/api/StepApi.mswMocks';
import YmlUtils from '@/core/utils/YmlUtils';
import { aiButtonEnabled, aiButtonUnavailable } from '@/storyutils/getAISettings.utils';

import WorkflowsPage from './WorkflowsPage';

type Story = StoryObj<typeof WorkflowsPage>;

const meta: Meta<typeof WorkflowsPage> = {
  component: WorkflowsPage,

  beforeEach({ msw }) {
    msw.use(
      StepApiMocks.getLocalStep({ status: 'success' }),
      getCertificates(),
      getProvProfiles(),
      getStacksAndMachines(),
      getFileStorageDocuments(),
      getDefaultOutputs(':appSlug'),
    );
  },

  parameters: {
    layout: 'fullscreen',
  },

  decorators: (Story) => (
    <Box h="100dvh">
      <Story />
    </Box>
  ),
};

const cliStory: Story = {
  beforeEach: ({ msw }) => {
    msw.use(
      StepApiMocks.getLocalStep({ status: 'success' }),
      getSecretsFromLocal(),
      getDefaultOutputs(),
      getStacksAndMachines(),
    );
    window.env.MODE = 'CLI';
    window.parent.pageProps = undefined;
    window.parent.globalProps = undefined;
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export const CliMode: Story = {
  ...cliStory,
};

export const WebsiteMode: Story = {
  beforeEach({ msw }) {
    msw.use(
      StepApiMocks.getLocalStep({ status: 'success' }),
      getSecrets(),
      getCertificates(),
      getProvProfiles(),
      getStacksAndMachines(),
      getFileStorageDocuments(),
      getDefaultOutputs(':appSlug'),
    );
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
  beforeEach({ msw }) {
    msw.use(getStacksAndMachines({ privateCloud: 'machine-overrides' }));
  },
};

export const LegacyDedicated: Story = {
  beforeEach({ msw }) {
    msw.use(getStacksAndMachines({ privateCloud: 'no-machines' }));
  },
};

export const SelfHostedRunner: Story = {
  beforeEach({ msw }) {
    msw.use(getStacksAndMachines({ hasSelfHostedRunner: true }));
  },
};

export const NoContainerDefinitions: Story = {
  parameters: {
    bitriseYmlStore: (() => {
      const yml = set(TEST_BITRISE_YML, 'containers', {});
      return { yml, ymlDocument: YmlUtils.toDoc(stringify(yml)) };
    })(),
  },
  beforeEach: () => {
    window.parent.pageProps = aiButtonEnabled();
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
      return {
        yml: TEST_BITRISE_YML,
        ymlDocument: YmlUtils.toDoc(stringify(TEST_BITRISE_YML)),
      };
    })(),
  },
};

export const EmptyCreateWithAI: Story = {
  beforeEach: () => {
    window.parent.pageProps = aiButtonEnabled();
  },
  parameters: {
    bitriseYmlStore: (() => {
      const yml = set(TEST_BITRISE_YML, 'workflows', {});
      return { yml, ymlDocument: YmlUtils.toDoc(stringify(yml)) };
    })(),
  },
};

export const EmptyWithoutCreateWithAI: Story = {
  beforeEach: () => {
    window.parent.pageProps = aiButtonUnavailable();
  },
  parameters: {
    bitriseYmlStore: (() => {
      const yml = set(TEST_BITRISE_YML, 'workflows', {});
      return { yml, ymlDocument: YmlUtils.toDoc(stringify(yml)) };
    })(),
  },
};

export default meta;
