import { Box } from '@chakra-ui/react/box';
import { Meta, StoryObj } from '@storybook/react-vite';
import { set } from 'es-toolkit/compat';
import { stringify } from 'yaml';

import ToolCatalogApiMocks from '@/core/api/ToolCatalogApi.mswMocks';
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
  parameters: {
    msw: {
      handlers: [ToolCatalogApiMocks.getToolCatalog()],
    },
  },
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

export const CatalogLoading: Story = {
  ...RootScope,
  parameters: {
    ...RootScope.parameters,
    msw: {
      handlers: [ToolCatalogApiMocks.getToolCatalogPending()],
    },
  },
};

export const CatalogError: Story = {
  ...RootScope,
  parameters: {
    ...RootScope.parameters,
    msw: {
      handlers: [ToolCatalogApiMocks.getToolCatalogError()],
    },
  },
};

export const RealApi: Story = {
  ...RootScope,
  parameters: {
    ...RootScope.parameters,
    msw: {
      handlers: [],
    },
  },
};

export const CustomTool: Story = {
  parameters: {
    bitriseYmlStore: (() => {
      const yml = set({ ...TEST_BITRISE_YML }, 'tools', {
        deno: '2.90.0',
      });
      return { yml, ymlDocument: YmlUtils.toDoc(stringify(yml)) };
    })(),
  },
};
