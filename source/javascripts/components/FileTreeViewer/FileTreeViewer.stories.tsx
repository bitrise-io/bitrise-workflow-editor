import { Box } from '@bitrise/bitkit';
import { Meta, StoryObj } from '@storybook/react-vite';

import { EntityIndex, TreeNode } from '@/core/models/Tree';
import { initializeModularConfig } from '@/core/stores/BitriseYmlStore';

import FileTreeViewer from './FileTreeViewer';

const leaf = (nodeId: string, path: string, source: TreeNode['source'], editable = true): TreeNode => ({
  nodeId,
  path,
  contents: `# ${path}\n`,
  source,
  commitSha: 'a1b2c3d4e5f6789012345678901234567890abcd',
  version: `v-${nodeId}`,
  editable,
  includes: [],
});

const ROOT: TreeNode = {
  nodeId: 'n_root',
  path: 'bitrise.yml',
  contents: 'format_version: "13"\n',
  source: null,
  commitSha: 'a1b2c3d4e5f6789012345678901234567890abcd',
  version: 'v-root',
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
    leaf(
      'n_tag',
      'pinned/release.yml',
      { path: 'pinned/release.yml', repository: null, branch: null, tag: 'v1.4.0', commit: null },
      false,
    ),
  ],
};

const ENTITY_INDEX: EntityIndex = { workflows: {}, pipelines: {}, stepBundles: {} };

export default {
  component: FileTreeViewer,
  beforeEach: () => {
    initializeModularConfig({ root: ROOT, entityIndex: ENTITY_INDEX, branch: 'main', commitSha: ROOT.commitSha });
  },
  decorators: [
    (Story) => (
      <Box display="flex" justifyContent="flex-end" padding="24">
        <Story />
      </Box>
    ),
  ],
} as Meta<typeof FileTreeViewer>;

type Story = StoryObj<typeof FileTreeViewer>;

export const Default: Story = {};
