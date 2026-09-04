import { Box } from '@chakra-ui/react/box';
import { Meta, StoryObj } from '@storybook/react-vite';
import { set } from 'es-toolkit/compat';

import JumpToFileButton from '@/components/JumpToDefinitionLink/JumpToFileButton';
import { getStacksAndMachines } from '@/core/api/StacksAndMachinesApi.mswMocks';
import ToolCatalogApiMocks from '@/core/api/ToolCatalogApi.mswMocks';
import { TreeNode } from '@/core/models/Tree';
import { FileSlice, MERGED_CONFIG_NODE_ID } from '@/core/stores/BitriseYmlStore';
import YmlUtils from '@/core/utils/YmlUtils';

import StackAndMachine from './StackAndMachine';

const SHA = 'a1b2c3d4e5f6789012345678901234567890abcd';

const TOOLS_YML = ['tools:', '  go: 1.23.0', '  nodejs: 22:latest', '  python: 3.13.4'].join('\n');

const ROOT_YML = [
  'meta:',
  '  bitrise.io:',
  '    stack: osx-xcode-16.0.x',
  '    machine_type_id: m2.medium',
  TOOLS_YML,
  'workflows:',
  '  primary:',
  '    steps: []',
  '',
].join('\n');

const MODULE_YML = [TOOLS_YML, 'workflows:', '  deploy:', '    steps: []', ''].join('\n');

const slice = (nodeId: string, path: string, contents: string, editable: boolean, source: FileSlice['source']) => {
  const doc = YmlUtils.toDoc(contents);
  return { nodeId, path, source, commitSha: SHA, editable, ymlDocument: doc, savedYmlDocument: doc };
};

const tree = (moduleEditable: boolean): TreeNode => ({
  nodeId: 'root',
  path: 'bitrise.yml',
  contents: ROOT_YML,
  source: null,
  commitSha: SHA,
  editable: true,
  includes: [
    {
      nodeId: 'n_mod',
      path: 'ci/deploy.yml',
      contents: MODULE_YML,
      source: moduleEditable
        ? { path: 'ci/deploy.yml', repository: null, branch: null, tag: null, commit: null }
        : { path: 'ci/deploy.yml', repository: 'bitrise-io/shared-ci', branch: 'main', tag: null, commit: null },
      commitSha: SHA,
      editable: moduleEditable,
      includes: [],
    },
  ],
});

/** Store state for a modular tree with `selectedNodeId` as the active view. */
const modularStore = ({
  selectedNodeId,
  moduleEditable = true,
}: {
  selectedNodeId: string;
  moduleEditable?: boolean;
}) => {
  const activeContents = selectedNodeId === 'n_mod' ? MODULE_YML : ROOT_YML;
  const activeDoc = YmlUtils.toDoc(activeContents);
  const treeNode = tree(moduleEditable);

  return {
    tree: treeNode,
    files: {
      root: slice('root', 'bitrise.yml', ROOT_YML, true, null),
      n_mod: slice('n_mod', 'ci/deploy.yml', MODULE_YML, moduleEditable, treeNode.includes[0].source),
    },
    selectedNodeId,
    mergedYml: ROOT_YML,
    ymlDocument: activeDoc,
    savedYmlDocument: activeDoc,
    yml: YmlUtils.toJSON(activeDoc),
  };
};

/** Single-file (non-modular) store, so the view is editable unless `forceReadOnly` is set. */
const singleFileStore = (() => {
  const doc = YmlUtils.toDoc(ROOT_YML);
  return {
    tree: undefined,
    files: {},
    selectedNodeId: undefined,
    ymlDocument: doc,
    savedYmlDocument: doc,
    yml: YmlUtils.toJSON(doc),
  };
})();

const meta: Meta<typeof StackAndMachine> = {
  component: StackAndMachine,
  args: {
    stackId: 'osx-xcode-16.0.x',
    machineTypeId: 'm2.medium',
  },
  decorators: [
    (Story) => (
      <Box padding="24">
        <Story />
      </Box>
    ),
  ],
  parameters: {
    bitriseYmlStore: singleFileStore,
    msw: {
      handlers: [getStacksAndMachines(), ToolCatalogApiMocks.getToolCatalog(), ToolCatalogApiMocks.getToolVersions()],
    },
  },
  beforeEach: () => {
    // Tool versions is the part of the card that renders differently in read-only mode.
    set(window, 'localFeatureFlags.enable-wfe-tool-versions', true);
    return () => set(window, 'localFeatureFlags.enable-wfe-tool-versions', false);
  },
};

export default meta;

type Story = StoryObj<typeof StackAndMachine>;

export const Editable: Story = {};

/** Editable despite the modular tree, so read-only detection must not fire here. */
export const ModularEditableFileView: Story = {
  parameters: {
    bitriseYmlStore: modularStore({ selectedNodeId: 'n_mod' }),
  },
};

/** Read-only because the caller says so (e.g. an inherited default rendered in a module). */
export const ForceReadOnly: Story = {
  args: {
    forceReadOnly: true,
    selectsTrailing: <JumpToFileButton nodeId="root" />,
  },
  parameters: {
    bitriseYmlStore: modularStore({ selectedNodeId: 'n_mod' }),
  },
};

/** Read-only because the merged config preview is active. */
export const MergedConfigView: Story = {
  parameters: {
    bitriseYmlStore: modularStore({ selectedNodeId: MERGED_CONFIG_NODE_ID }),
  },
};

/** Read-only because the selected file comes from another repo. */
export const CrossRepoFileView: Story = {
  parameters: {
    bitriseYmlStore: modularStore({ selectedNodeId: 'n_mod', moduleEditable: false }),
  },
};

/** Read-only, collapsed variant used by the workflow cards. */
export const ReadOnlyExpandable: Story = {
  ...MergedConfigView,
  args: { isExpandable: true },
};
