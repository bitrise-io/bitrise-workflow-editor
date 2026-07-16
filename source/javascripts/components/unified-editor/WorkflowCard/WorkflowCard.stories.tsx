import { Meta, StoryObj } from '@storybook/react-vite';

import { TreeNode } from '@/core/models/Tree';
import { initializeModularConfig } from '@/core/stores/BitriseYmlStore';

import WorkflowCard from './WorkflowCard';

export default {
  component: WorkflowCard,
  argTypes: {
    // Workflow actions
    onCreateWorkflow: { type: 'function' },
    onChainWorkflow: { type: 'function' },
    onChainChainedWorkflow: { type: 'function' },
    onEditWorkflow: { type: 'function' },
    onEditChainedWorkflow: { type: 'function' },
    onRemoveWorkflow: { type: 'function' },
    onRemoveChainedWorkflow: { type: 'function' },
    onChainedWorkflowsUpdate: {
      type: 'function',
    },
    // Step actions
    onAddStep: { type: 'function' },
    onMoveStep: { type: 'function' },
    onSelectStep: { type: 'function' },
    onUpgradeStep: { type: 'function' },
    onCloneStep: { type: 'function' },
    onDeleteStep: { type: 'function' },
  },
  args: {
    id: 'wf1',
    isCollapsable: true,
  },
} as Meta<typeof WorkflowCard>;

type Story = StoryObj<typeof WorkflowCard>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    id: 'empty',
  },
};

// A cross-file ("ghost") workflow: defined in another module, so it can't be edited here. The card
// renders with the subtler `minElevated` look (border/minimal + small shadow, no background tint)
// and a jump-to-definition button instead of the editable chrome.
const GHOST_ROOT: TreeNode = {
  nodeId: 'n_root',
  path: 'bitrise.yml',
  contents: 'format_version: "13"\n',
  source: null,
  commitSha: 'a1b2c3d4e5f6789012345678901234567890abcd',
  editable: true,
  includes: [
    {
      nodeId: 'n_mod',
      path: 'modules/workflows.yml',
      contents: 'workflows:\n  ghost-wf: {}\n',
      source: { path: 'modules/workflows.yml', repository: null, branch: null, tag: null, commit: null },
      commitSha: 'a1b2c3d4e5f6789012345678901234567890abcd',
      editable: true,
      includes: [],
    },
  ],
};

export const Ghost: Story = {
  args: {
    id: 'ghost-wf',
  },
  beforeEach: () => {
    initializeModularConfig({
      root: GHOST_ROOT,
      branch: 'main',
      commitSha: GHOST_ROOT.commitSha,
    });
  },
};
