import { Box } from '@bitrise/bitkit';
import { Meta, StoryObj } from '@storybook/react-vite';

import { EntityIndex, TreeNode } from '@/core/models/Tree';
import { initializeModularConfig, openTab } from '@/core/stores/BitriseYmlStore';

import OpenFileTabs from './OpenFileTabs';

const leaf = (nodeId: string, path: string, source: TreeNode['source'], editable = true): TreeNode => ({
  nodeId,
  path,
  contents: `# ${path}\n`,
  source,
  commitSha: 'a1b2c3d4e5f6789012345678901234567890abcd',
  editable,
  includes: [],
});

const ROOT: TreeNode = {
  nodeId: 'n_root',
  path: 'bitrise.yml',
  contents: 'format_version: "13"\n',
  source: null,
  commitSha: 'a1b2c3d4e5f6789012345678901234567890abcd',
  editable: true,
  includes: [
    leaf('n_local', 'modules/workflows.yml', {
      path: 'modules/workflows.yml',
      repository: null,
      branch: null,
      tag: null,
      commit: null,
    }),
    leaf(
      'n_repo',
      'shared/build.yml',
      { path: 'shared/build.yml', repository: 'shared-modules', branch: 'main', tag: null, commit: null },
      false,
    ),
  ],
};

const ENTITY_INDEX: EntityIndex = { workflows: {}, pipelines: {}, stepBundles: {} };

export default {
  component: OpenFileTabs,
  beforeEach: () => {
    initializeModularConfig({ root: ROOT, entityIndex: ENTITY_INDEX, branch: 'main', commitSha: ROOT.commitSha });
    openTab('n_local');
    openTab('n_repo');
  },
  decorators: [
    (Story) => (
      <Box height="100dvh">
        <Story />
      </Box>
    ),
  ],
} as Meta<typeof OpenFileTabs>;

type Story = StoryObj<typeof OpenFileTabs>;

export const Default: Story = {};
