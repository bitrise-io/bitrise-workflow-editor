import { Box } from '@chakra-ui/react/box';
import { Meta, StoryObj } from '@storybook/react-vite';
import { set } from 'es-toolkit/compat';
import { stringify } from 'yaml';

import ToolCatalogApiMocks from '@/core/api/ToolCatalogApi.mswMocks';
import YmlUtils from '@/core/utils/YmlUtils';

import ToolVersions from './ToolVersions';

const meta: Meta<typeof ToolVersions> = {
  component: ToolVersions,
  args: {
    stackReportUrl: 'https://bitrise.io/stacks/stack_reports/osx-xcode-26.6.x#languages-and-runtimes',
  },
  decorators: [
    (Story) => (
      <Box padding="24">
        <Story />
      </Box>
    ),
  ],
  parameters: {
    msw: {
      handlers: [ToolCatalogApiMocks.getToolCatalog(), ToolCatalogApiMocks.getToolVersions()],
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

/** All five strategies at once, so each control combination is visible side by side. */
export const AllStrategies: Story = {
  args: { workflowId: 'generator' },
  parameters: {
    bitriseYmlStore: (() => {
      const yml = set({ ...TEST_BITRISE_YML }, 'workflows.generator.tools', {
        node: '22:latest',
        ruby: '3.3:installed',
        golang: 'latest',
        python: 'installed',
        flutter: '3.32.0',
        deno: 'latest',
        elixir: 'unset',
      });
      return { yml, ymlDocument: YmlUtils.toDoc(stringify(yml)) };
    })(),
  },
};

/** A prefixed value on a tool the catalog does not know: no candidates, so the prefix is typed. */
export const CatalogFreePrefix: Story = {
  parameters: {
    bitriseYmlStore: (() => {
      const yml = set({ ...TEST_BITRISE_YML }, 'tools', { deno: '2.90:latest' });
      return { yml, ymlDocument: YmlUtils.toDoc(stringify(yml)) };
    })(),
  },
};

/** A catalog that is mostly not semver: prefixes come from cutting the values at separators. */
export const NonSemverTool: Story = {
  parameters: {
    bitriseYmlStore: (() => {
      const yml = set({ ...TEST_BITRISE_YML }, 'tools', { java: 'zulu-musl-8:latest' });
      return { yml, ymlDocument: YmlUtils.toDoc(stringify(yml)) };
    })(),
  },
};

/** A catalog with no version numbers: the prefix is typed, since suggestions would be useless. */
export const ChannelNamesOnly: Story = {
  parameters: {
    bitriseYmlStore: (() => {
      const yml = set({ ...TEST_BITRISE_YML }, 'tools', { elixir: 'night:latest' });
      return { yml, ymlDocument: YmlUtils.toDoc(stringify(yml)) };
    })(),
  },
};

/** A prefix the catalog cannot resolve. Still valid YAML, so it warns rather than errors. */
export const UnknownPrefix: Story = {
  parameters: {
    bitriseYmlStore: (() => {
      const yml = set({ ...TEST_BITRISE_YML }, 'tools', { nodejs: '18.99:latest' });
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

export const VersionNotInCatalog: Story = {
  parameters: {
    bitriseYmlStore: (() => {
      const yml = set({ ...TEST_BITRISE_YML }, 'tools', {
        nodejs: '999.999.999',
      });
      return { yml, ymlDocument: YmlUtils.toDoc(stringify(yml)) };
    })(),
  },
};

export const EmptyExactVersion: Story = {
  parameters: {
    bitriseYmlStore: (() => {
      const yml = set({ ...TEST_BITRISE_YML }, 'tools', {
        nodejs: '',
      });
      return { yml, ymlDocument: YmlUtils.toDoc(stringify(yml)) };
    })(),
  },
};

export const VersionsLoading: Story = {
  ...RootScope,
  parameters: {
    ...RootScope.parameters,
    msw: {
      handlers: [ToolCatalogApiMocks.getToolCatalog(), ToolCatalogApiMocks.getToolVersionsPending()],
    },
  },
};

export const VersionsError: Story = {
  ...RootScope,
  parameters: {
    ...RootScope.parameters,
    msw: {
      handlers: [ToolCatalogApiMocks.getToolCatalog(), ToolCatalogApiMocks.getToolVersionsError()],
    },
  },
};
