import { Box } from '@bitrise/bitkit';
import { Meta, StoryObj } from '@storybook/react-vite';
import { set } from 'es-toolkit/compat';

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
    window.parent.pageProps = {
      ...window.parent.pageProps,
      settings: {
        ai: {
          ciConfigExpert: {
            options: { wfeIntegration: true },
          },
          failedBuilds: {
            disabled: 'by-project',
            options: undefined,
          },
          fixer: {
            disabled: 'by-project',
            options: undefined,
          },
        },
      },
    };
  },
} as Meta<typeof PipelinesPage>;

type Story = StoryObj<typeof PipelinesPage>;

export const CreateFirstGraphPipeline: Story = {
  beforeEach: () => {
    window.parent.pageProps = {
      ...window.parent.pageProps,
      settings: {
        ai: {
          ciConfigExpert: {
            disabled: 'by-workspace',
            options: undefined,
          },
          failedBuilds: {
            disabled: 'by-project',
            options: undefined,
          },
          fixer: {
            disabled: 'by-project',
            options: undefined,
          },
        },
      },
    };
  },
  parameters: {
    bitriseYmlStore: { yml: { format_version: '2' } },
  },
};

export const EmptyWithCreateWithAI: Story = {
  parameters: {
    bitriseYmlStore: { yml: { format_version: '2' } },
  },
};

export const EmptyWithCreateWithAIDisabled: Story = {
  beforeEach: () => {
    window.parent.pageProps = {
      ...window.parent.pageProps,
      settings: {
        ai: {
          ciConfigExpert: {
            disabled: 'by-project',
            options: undefined,
          },
          failedBuilds: {
            disabled: 'by-project',
            options: undefined,
          },
          fixer: {
            disabled: 'by-project',
            options: undefined,
          },
        },
      },
    };
  },
  parameters: {
    bitriseYmlStore: { yml: { format_version: '2' } },
  },
};

export const UpgradePlan: Story = {
  parameters: {
    bitriseYmlStore: { yml: { format_version: '2' } },
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
    bitriseYmlStore: (() => {
      set(TEST_BITRISE_YML, 'pipelines["graph-pipeline"].workflows.override', {
        uses: 'wf3',
        depends_on: ['wf1'],
      });
      return { yml: TEST_BITRISE_YML };
    })(),
  },
};

export const WithParallelWorkflowCollision: Story = {
  parameters: {
    bitriseYmlStore: (() => {
      const yml = TEST_BITRISE_YML;
      set(yml, 'workflows.tmp_3', {});
      set(yml, 'pipelines["graph-pipeline"].workflows.tmp_2', { uses: 'tmp' });
      return { yml };
    })(),
  },
};
