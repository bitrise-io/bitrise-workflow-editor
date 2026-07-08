import { Meta, StoryObj } from '@storybook/react-vite';

import { TreeNode } from '@/core/models/Tree';
import { FileSlice, MERGED_CONFIG_NODE_ID } from '@/core/stores/BitriseYmlStore';
import YmlUtils from '@/core/utils/YmlUtils';

import EnvVarsPage from './EnvVarsPage';

type Story = StoryObj<typeof EnvVarsPage>;

const meta: Meta<typeof EnvVarsPage> = {
  component: EnvVarsPage,
  parameters: {
    layout: 'fullscreen',
  },
};

export const Default: Story = {};

// --- Modular config (BIVS-3712) ---------------------------------------------------------------

const SHA = 'a1b2c3d4e5f6789012345678901234567890abcd';

// Root defines a project env var + a workflow env var; the module defines a workflow but no env vars.
const ROOT_YML = [
  'app:',
  '  envs:',
  '    - FOO: bar',
  'workflows:',
  '  primary:',
  '    envs:',
  '      - WF_VAR: hello',
  '    steps: []',
  '',
].join('\n');

const MODULE_YML = ['workflows:', '  deploy:', '    steps: []', ''].join('\n');

const MERGED_YML = [
  'app:',
  '  envs:',
  '    - FOO: bar',
  'workflows:',
  '  primary:',
  '    envs:',
  '      - WF_VAR: hello',
  '    steps: []',
  '  deploy:',
  '    steps: []',
  '',
].join('\n');

// Neither file defines any env var.
const ROOT_YML_NO_ENVS = ['workflows:', '  primary:', '    steps: []', ''].join('\n');
const MERGED_YML_NO_ENVS = ['workflows:', '  primary:', '    steps: []', '  deploy:', '    steps: []', ''].join('\n');

const slice = (nodeId: string, path: string, contents: string): FileSlice => {
  const doc = YmlUtils.toDoc(contents);
  return { nodeId, path, source: null, commitSha: SHA, editable: true, ymlDocument: doc, savedYmlDocument: doc };
};

const modularStore = (rootContents: string, moduleContents: string, mergedContents: string) => {
  const tree: TreeNode = {
    nodeId: 'root',
    path: 'bitrise.yml',
    contents: rootContents,
    source: null,
    commitSha: SHA,
    editable: true,
    includes: [
      {
        nodeId: 'n_mod',
        path: 'ci/deploy.yml',
        contents: moduleContents,
        source: { path: 'ci/deploy.yml', repository: null, branch: null, tag: null, commit: null },
        commitSha: SHA,
        editable: true,
        includes: [],
      },
    ],
  };
  const mergedDoc = YmlUtils.toDoc(mergedContents);
  return {
    tree,
    files: { root: slice('root', 'bitrise.yml', rootContents), n_mod: slice('n_mod', 'ci/deploy.yml', moduleContents) },
    selectedNodeId: MERGED_CONFIG_NODE_ID,
    mergedYml: mergedContents,
    ymlDocument: mergedDoc,
    savedYmlDocument: mergedDoc,
    yml: YmlUtils.toJSON(mergedDoc),
  };
};

// Merged view: per-file / per-(workflow, file) sections, with "No Environment Variables defined."
// placeholders for the module that defines none.
export const ModularMergedPartiallyEmpty: Story = {
  parameters: {
    bitriseYmlStore: modularStore(ROOT_YML, MODULE_YML, MERGED_YML),
  },
};

// Merged view where no module defines any env var: a single "No Environment Variables created in any
// modules." empty state (on both the Project and Workflows tabs).
export const ModularMergedAllEmpty: Story = {
  parameters: {
    bitriseYmlStore: modularStore(ROOT_YML_NO_ENVS, MODULE_YML, MERGED_YML_NO_ENVS),
  },
};

export default meta;
