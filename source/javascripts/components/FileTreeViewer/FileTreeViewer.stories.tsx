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
  editable,
  includes: [],
});

const src = (partial: Partial<NonNullable<TreeNode['source']>>): TreeNode['source'] => ({
  path: null,
  repository: null,
  branch: null,
  tag: null,
  commit: null,
  ...partial,
});

const ROOT: TreeNode = {
  nodeId: 'n_root',
  path: 'bitrise.yml',
  contents: 'format_version: "13"\n',
  source: null,
  commitSha: 'a1b2c3d4e5f6789012345678901234567890abcd',
  editable: true,
  includes: [
    leaf('n_testing', 'e2e/bitrise/testing/testing.yml', src({ path: 'e2e/bitrise/testing/testing.yml' })),
    leaf(
      'n_pipelines',
      'e2e/bitrise/testing/browserstack/pipelines.yml',
      src({ path: 'e2e/bitrise/testing/browserstack/pipelines.yml', branch: 'branch-a' }),
    ),
    leaf(
      'n_wf',
      'e2e/bitrise/testing/browserstack/workflows/workflows.yml',
      src({ path: 'e2e/bitrise/testing/browserstack/workflows/workflows.yml', commit: '9d1df0011223344' }),
    ),
    leaf(
      'n_wf2',
      'e2e/bitrise/testing/browserstack/workflows/workflows2.yml',
      src({ path: 'e2e/bitrise/testing/browserstack/workflows/workflows2.yml', tag: 'tag-a' }),
    ),
    leaf(
      'n_build',
      'e2e/bitrise/testing/browserstack/workflows/build_app.yml',
      src({ path: 'e2e/bitrise/testing/browserstack/workflows/build_app.yml' }),
    ),
    {
      ...leaf('n_other', 'bitrise.yml', src({ repository: 'another-repo-name', branch: 'main' }), false),
      includes: [
        leaf(
          'n_other_wf',
          'workflow_templates/workflows.yml',
          src({ path: 'workflow_templates/workflows.yml' }),
          false,
        ),
      ],
    },
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
