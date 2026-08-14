import { Box } from '@chakra-ui/react/box';
import { Meta, StoryObj } from '@storybook/react-vite';
import { set } from 'es-toolkit/compat';
import { stringify } from 'yaml';

import ToolCatalogApiMocks from '@/core/api/ToolCatalogApi.mswMocks';
import YmlUtils from '@/core/utils/YmlUtils';
import YamlPanel from '@/storyutils/YamlPanel';

import ToolVersions from './ToolVersions';

/** A store holding one `tools` block. Cloned, since `set` writes into shared nested objects. */
const withTools = (tools: Record<string, string>, workflowId?: string) => {
  const path = workflowId ? `workflows.${workflowId}.tools` : 'tools';
  const yml = set(structuredClone(TEST_BITRISE_YML), path, tools);

  return { yml, ymlDocument: YmlUtils.toDoc(stringify(yml)) };
};

const meta: Meta<typeof ToolVersions> = {
  component: ToolVersions,
  args: {
    stackReportUrl: 'https://bitrise.io/stacks/stack_reports/osx-xcode-26.6.x#languages-and-runtimes',
  },
  // One decorator owns both layouts, so the padding is not applied twice.
  decorators: [
    (Story, { parameters }) =>
      parameters.yamlPreview ? (
        <Box display="flex" gap="32" padding="24" alignItems="flex-start">
          <Box flex="1" minWidth="0">
            <Story />
          </Box>
          <YamlPanel />
        </Box>
      ) : (
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
    bitriseYmlStore: withTools({
      go: '1.23.0',
      node: '22:latest',
      ruby: 'installed',
      python: '3.13.4',
    }),
  },
};

export const WorkflowScope: Story = {
  args: {
    workflowId: 'generator',
  },
  parameters: {
    bitriseYmlStore: withTools({ node: '22:latest', python: '3.13.4' }, 'generator'),
  },
};

/** All five strategies at once, so each control combination is visible side by side. */
export const AllStrategies: Story = {
  args: { workflowId: 'generator' },
  parameters: {
    bitriseYmlStore: withTools(
      {
        node: '22:latest',
        ruby: '3.3:installed',
        golang: 'latest',
        python: 'installed',
        flutter: '3.32.0',
        deno: 'latest',
        elixir: 'unset',
      },
      'generator',
    ),
  },
};

/**
 * A prefixed value on a tool the catalog does not know. `latest-of` has no candidates to offer
 * here, so it stays available on free text only because the YAML already holds it.
 */
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

/** A prefix the catalog cannot resolve. Still valid YAML, so it warns rather than errors. */
export const UnknownPrefix: Story = {
  parameters: {
    bitriseYmlStore: withTools({ nodejs: '18.99:latest' }),
  },
};

/** A prefix sharing only leading characters, so `24.2` warns instead of matching `24.20.0`. */
export const PrefixAcrossSeparator: Story = {
  parameters: {
    bitriseYmlStore: withTools({ nodejs: '2:latest' }),
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
    bitriseYmlStore: withTools({ deno: '2.90.0' }),
  },
};

export const VersionNotInCatalog: Story = {
  parameters: {
    bitriseYmlStore: withTools({ nodejs: '999.999.999' }),
  },
};

export const EmptyExactVersion: Story = {
  parameters: {
    bitriseYmlStore: withTools({ nodejs: '' }),
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

/** Editable YAML beside the rows, so a change can be driven from either side. */
export const YamlPreview: Story = {
  parameters: {
    yamlPreview: true,
    bitriseYmlStore: withTools({
      nodejs: '22:latest',
      ruby: '3.3:installed',
      golang: 'latest',
      deno: '2.90:latest',
    }),
  },
};

export const YamlPreviewWorkflowScope: Story = {
  args: {
    workflowId: 'generator',
  },
  parameters: {
    yamlPreview: true,
    bitriseYmlStore: withTools({ python: '3.13.4' }, 'generator'),
  },
};
