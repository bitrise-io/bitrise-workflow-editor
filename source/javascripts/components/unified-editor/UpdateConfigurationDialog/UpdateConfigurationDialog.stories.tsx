import { Meta, StoryObj } from '@storybook/react-vite';
import { delay, http, HttpResponse } from 'msw';

import { TreeNode } from '@/core/models/Tree';
import { bitriseYmlStore, initializeModularConfig, updateFileDocument } from '@/core/stores/BitriseYmlStore';
import YmlUtils from '@/core/utils/YmlUtils';
import { getCiConfig } from '@/pages/YmlPage/components/ConfigurationYmlStorage.mswMocks';

import UpdateConfigurationDialog from './UpdateConfigurationDialog';

const formatYml = () => {
  return http.post('/api/cli/format', async () => {
    await delay();
    return new HttpResponse('formatted ciConfigYml content from API', {
      status: 200,
    });
  });
};

const SHA = 'a1b2c3d4e5f6789012345678901234567890abcd';

const moduleLeaf = (nodeId: string, path: string): TreeNode => ({
  nodeId,
  path,
  contents: `# ${path}\n`,
  source: { path, repository: null, branch: null, tag: null, commit: null },
  commitSha: SHA,
  editable: true,
  includes: [],
});

const MODULAR_ROOT: TreeNode = {
  nodeId: 'n_root',
  path: 'bitrise.yml',
  contents: 'format_version: "13"\n',
  source: null,
  commitSha: SHA,
  editable: true,
  includes: [
    moduleLeaf('n_pipelines', 'ci_config/pipelines/pipelines.yml'),
    moduleLeaf('n_workflows', 'ci_config/workflows/workflows.yml'),
  ],
};

export default {
  component: UpdateConfigurationDialog,
  args: {
    isOpen: true,
  },
  argTypes: {
    onClose: { type: 'function' },
  },
  // Stories share the module-level store; start each one from a single (non-modular) config.
  beforeEach: () => {
    bitriseYmlStore.setState({ tree: undefined, files: {} });
  },
  parameters: {
    msw: {
      handlers: [formatYml(), getCiConfig()],
    },
  },
} as Meta<typeof UpdateConfigurationDialog>;

type Story = StoryObj<typeof UpdateConfigurationDialog>;

export const Default: Story = {};

export const Failed: Story = {
  parameters: {
    msw: {
      handlers: [
        formatYml(),
        getCiConfig(
          'config (/tmp/config20241207-26-5782vz.yaml) is not valid: trigger item #1: non-existent workflow defined as trigger target: primary',
        ),
      ],
    },
  },
};

export const Modular: Story = {
  beforeEach: () => {
    initializeModularConfig({ root: MODULAR_ROOT, branch: 'main', commitSha: SHA });
    // Make both module files dirty so they show up as changed modules.
    updateFileDocument('n_pipelines', ({ doc }) => {
      YmlUtils.setIn(doc, ['pipelines', 'pl-1'], {});
      return doc;
    });
    updateFileDocument('n_workflows', ({ doc }) => {
      YmlUtils.setIn(doc, ['workflows', 'wf-1'], {});
      return doc;
    });
  },
};
