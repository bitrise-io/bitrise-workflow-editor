import { Meta, StoryObj } from '@storybook/react';
import { Box } from '@bitrise/bitkit';
import { MockYml } from '@/core/models/BitriseYml.mocks';
import { getStacksAndMachines } from '@/core/api/StacksAndMachinesApi.mswMocks';
import WorkflowsPage from './WorkflowsPage';

type Story = StoryObj<typeof WorkflowsPage>;

const meta: Meta<typeof WorkflowsPage> = {
  component: WorkflowsPage,
  args: {
    yml: MockYml,
  },
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: [getStacksAndMachines()] },
  },
  argTypes: {
    onChange: {
      type: 'function',
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
    window.pageProps = undefined;
  },
};

const websiteStory: Story = {
  beforeEach: () => {
    process.env.MODE = 'website';
    window.pageProps = {
      project: {
        slug: 'asd-123',
        name: 'Mock Project',
      },
    };
  },
};

export const CliMode: Story = {
  ...cliStory,
};

export const WebsiteMode: Story = {
  ...websiteStory,
};

export const DedicatedMachine: Story = {
  ...websiteStory,
  parameters: {
    msw: { handlers: [getStacksAndMachines({ hasDedicatedMachine: true })] },
  },
};

export const SelfHostedRunner: Story = {
  ...websiteStory,
  parameters: {
    msw: { handlers: [getStacksAndMachines({ hasSelfHostedRunner: true })] },
  },
};

export default meta;
