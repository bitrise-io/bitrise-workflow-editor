import { Box } from '@chakra-ui/react/box';
import { Meta, StoryObj } from '@storybook/react-vite';
import { set } from 'es-toolkit/compat';
import { stringify } from 'yaml';

import YmlUtils from '@/core/utils/YmlUtils';

import ToolVersions from './ToolVersions';

const meta: Meta<typeof ToolVersions> = {
  component: ToolVersions,
  decorators: [
    (Story) => (
      <Box padding="24">
        <Story />
      </Box>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ToolVersions>;

export const RootScope: Story = {
  parameters: {
    bitriseYmlStore: (() => {
      const yml = set({ ...TEST_BITRISE_YML }, 'tools', {
        go: '1.23.0',
        node: '22:latest',
        ruby: 'installed',
        python: '3.13.4',
      });
      return { yml, ymlDocument: YmlUtils.toDoc(stringify(yml)) };
    })(),
  },
};

export const WorkflowScope: Story = {
  args: {
    workflowId: 'generator',
  },
  parameters: {
    bitriseYmlStore: (() => {
      const yml = set({ ...TEST_BITRISE_YML }, 'workflows.generator.tools', {
        node: '22:latest',
        python: '3.13.4',
      });
      return { yml, ymlDocument: YmlUtils.toDoc(stringify(yml)) };
    })(),
  },
};

export const Empty: Story = {};
