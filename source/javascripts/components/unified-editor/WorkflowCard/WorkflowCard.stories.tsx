import { Meta, StoryObj } from '@storybook/react-vite';

import { TreeNode } from '@/core/models/Tree';
import { initializeModularConfig } from '@/core/stores/BitriseYmlStore';
import YmlUtils from '@/core/utils/YmlUtils';

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
// renders as the elevated card (border/minimal + small shadow, no background tint)
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

// wf2 runs wf1 before it and wf3, wf7, wf7 after it, so the card shows chained workflow cards.
export const WithChainedWorkflows: Story = {
  args: {
    id: 'wf2',
    isCollapsable: false,
  },
};

// The open file is read-only (as a file from another repository or ref is), so the steps and the step
// bundle inside the card render as ghosts. The file is the shared test config, because the Storybook
// preview resets the document to it after the story sets up.
const READ_ONLY_ROOT: TreeNode = {
  nodeId: 'n_root',
  path: 'bitrise.yml',
  contents: YmlUtils.toYml(TEST_BITRISE_YML as never),
  source: null,
  commitSha: 'a1b2c3d4e5f6789012345678901234567890abcd',
  editable: false,
  includes: [],
};

export const ReadOnly: Story = {
  args: {
    isCollapsable: false,
  },
  beforeEach: () => {
    initializeModularConfig({
      root: READ_ONLY_ROOT,
      branch: 'main',
      commitSha: READ_ONLY_ROOT.commitSha,
    });
  },
};
