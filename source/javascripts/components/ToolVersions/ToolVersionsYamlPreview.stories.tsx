import { Box } from '@chakra-ui/react/box';
import { Stack } from '@chakra-ui/react/stack';
import { Text } from '@chakra-ui/react/text';
import { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';

import ToolCatalogApiMocks from '@/core/api/ToolCatalogApi.mswMocks';
import { bitriseYmlStore } from '@/core/stores/BitriseYmlStore';
import YmlUtils from '@/core/utils/YmlUtils';

import ToolVersions from './ToolVersions';

const ROOT_YML = [
  "format_version: '13'",
  'tools:',
  '  nodejs: 22:latest',
  '  ruby: 3.3:installed',
  '  golang: latest',
  '  deno: 2.90:latest',
  'workflows:',
  '  primary:',
  '    tools:',
  '      python: 3.13.4',
  '    steps: []',
  '',
].join('\n');

/** Live view of the store's document, so every edit shows up as the YAML that gets written. */
const YamlPanel = () => {
  const [yml, setYml] = useState(() => YmlUtils.toYml(bitriseYmlStore.getState().ymlDocument));

  useEffect(() => bitriseYmlStore.subscribe((state) => setYml(YmlUtils.toYml(state.ymlDocument))), []);

  return (
    <Stack gap="8" minWidth="320" flexShrink="0">
      <Text textStyle="heading/h5">bitrise.yml</Text>
      <Box
        as="pre"
        textStyle="code/md"
        padding="16"
        borderRadius="8"
        background="background/secondary"
        borderWidth="1"
        borderStyle="solid"
        borderColor="border/minimal"
        overflowX="auto"
      >
        {yml}
      </Box>
    </Stack>
  );
};

const meta: Meta<typeof ToolVersions> = {
  component: ToolVersions,
  args: {
    stackReportUrl: 'https://bitrise.io/stacks/stack_reports/osx-xcode-26.6.x#languages-and-runtimes',
  },
  decorators: [
    (Story) => (
      <Box display="flex" gap="32" padding="24" alignItems="flex-start">
        <Box flex="1" minWidth="0">
          <Story />
        </Box>
        <YamlPanel />
      </Box>
    ),
  ],
  parameters: {
    bitriseYmlStore: (() => {
      const doc = YmlUtils.toDoc(ROOT_YML);
      return { yml: YmlUtils.toJSON(doc), ymlDocument: doc, savedYmlDocument: YmlUtils.toDoc(ROOT_YML) };
    })(),
    msw: {
      handlers: [ToolCatalogApiMocks.getToolCatalog(), ToolCatalogApiMocks.getToolVersions()],
    },
  },
};

export default meta;

type Story = StoryObj<typeof ToolVersions>;

export const RootScope: Story = {};

export const WorkflowScope: Story = {
  args: { workflowId: 'primary' },
};
