import { Meta, StoryObj } from '@storybook/react-vite';
import { set } from 'es-toolkit/compat';
import { stringify } from 'yaml';

import { getStacksAndMachines } from '@/core/api/StacksAndMachinesApi.mswMocks';
import { TreeNode } from '@/core/models/Tree';
import { FileSlice, MERGED_CONFIG_NODE_ID } from '@/core/stores/BitriseYmlStore';
import YmlUtils from '@/core/utils/YmlUtils';

import StacksAndMachinesPage from './StacksAndMachinesPage';

const getGracePeriod = (deprecatedMachinesPeriod?: 'before' | 'in' | 'after') => {
  let shiftDays = 1;

  if (deprecatedMachinesPeriod === 'before') {
    shiftDays = 7;
  }
  if (deprecatedMachinesPeriod === 'after') {
    shiftDays = -7;
  }

  const oneDay = 86400000; // 24 hours in milliseconds
  const actualTs = Date.now() + oneDay * shiftDays;

  return {
    grace_period_started_at: new Date(actualTs - oneDay * 3).toISOString().split('T')[0],
    grace_period_ended_at: new Date(actualTs + oneDay * 3).toISOString().split('T')[0],
  };
};

type Story = StoryObj<typeof StacksAndMachinesPage>;

const meta: Meta<typeof StacksAndMachinesPage> = {
  component: StacksAndMachinesPage,
  argTypes: {
    deprecatedMachinesPeriod: {
      control: 'inline-radio',
      options: ['before', 'in', 'after'],
    },
  },
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: {
        story: [getStacksAndMachines({ hasSelfHostedRunner: true })],
      },
    },
  },
  beforeEach: () => {
    set(window, 'parent.pageProps.project.isOwnerPaying', true);
  },
};

export const PayingUser: Story = {};

export const FreeUser: Story = {
  beforeEach: () => {
    set(window, 'parent.pageProps.project.isOwnerPaying', false);
  },
};

export const RegionLockedUser: Story = {
  parameters: {
    msw: {
      handlers: {
        story: [getStacksAndMachines({ regionLocked: true })],
      },
    },
  },
};

export const WithInvalidStackRollbackVersion: Story = {
  parameters: {
    bitriseYmlStore: (() => {
      const yml = set(TEST_BITRISE_YML, 'meta["bitrise.io"]', {
        stack: 'osx-xcode-15.0.x',
        machine_type_id: 'm2.large',
        stack_rollback_version: '1.0.0',
      });
      return { yml, ymlDocument: YmlUtils.toDoc(stringify(yml)) };
    })(),
  },
};

export const WithDeprecatedMachines: Story = {
  args: {
    deprecatedMachinesPeriod: 'in',
  },
  parameters: {
    bitriseYmlStore: (() => {
      const yml = set(TEST_BITRISE_YML, 'meta["bitrise.io"]', {
        stack: 'ubuntu-jammy-22.04-bitrise-2024',
        machine_type_id: 'standard',
      });
      return { yml, ymlDocument: YmlUtils.toDoc(stringify(yml)) };
    })(),
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  beforeEach: ({ args }: any) => {
    set(
      window,
      'parent.globalProps.account.useReplacementForDeprecatedMachines',
      getGracePeriod(args.deprecatedMachinesPeriod || 'in'),
    );
  },
};

export const WithDedicatedMachines: Story = {
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: {
        story: [getStacksAndMachines({ privateCloud: 'machine-overrides' })],
      },
    },
  },
};

export const WithLegacyDedicated: Story = {
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: {
        story: [getStacksAndMachines({ privateCloud: 'no-machines' })],
      },
    },
  },
};

export const WithInvalidDefaultMachine: Story = {
  parameters: {
    bitriseYmlStore: (() => {
      const yml = set(TEST_BITRISE_YML, 'meta["bitrise.io"]', {
        stack: 'osx-xcode-15.0.x',
        machine_type_id: 'invalid',
      });
      return { yml, ymlDocument: YmlUtils.toDoc(stringify(yml)) };
    })(),
  },
};

export const WithInvalidWorkflowMachine: Story = {
  parameters: {
    bitriseYmlStore: (() => {
      const yml = set(TEST_BITRISE_YML, 'workflows["custom-steplib-steps"]["meta"]["bitrise.io"]', {
        stack: 'osx-xcode-15.0.x',
        machine_type_id: 'invalid',
      });
      return { yml, ymlDocument: YmlUtils.toDoc(stringify(yml)) };
    })(),
  },
};

export const WithInvalidDefaultStack: Story = {
  parameters: {
    bitriseYmlStore: (() => {
      const yml = set(TEST_BITRISE_YML, 'meta["bitrise.io"]', {
        stack: 'invalid',
        machine_type_id: 'm2.large',
      });
      return { yml, ymlDocument: YmlUtils.toDoc(stringify(yml)) };
    })(),
  },
};

export const WithToolVersions: Story = {
  beforeEach: () => {
    set(window, 'localFeatureFlags.enable-wfe-tool-versions', true);
  },
};

// --- Modular config (BIVS-3713) ---------------------------------------------------------------

const MODULAR_SHA = 'a1b2c3d4e5f6789012345678901234567890abcd';

// Root defines the default stack/machine + a workflow; the included module defines only a workflow.
const ROOT_YML = [
  'meta:',
  '  bitrise.io:',
  '    stack: ubuntu-jammy-22.04-bitrise-2024',
  '    machine_type_id: standard',
  'workflows:',
  '  primary:',
  '    steps: []',
  '',
].join('\n');

const MODULE_YML = ['workflows:', '  deploy:', '    steps: []', ''].join('\n');

// A module that also defines its own default (for the merged per-module breakdown, BIVS-3714).
const MODULE_YML_WITH_DEFAULT = [
  'meta:',
  '  bitrise.io:',
  '    stack: ubuntu-jammy-22.04-bitrise-2024',
  '    machine_type_id: standard',
  'workflows:',
  '  deploy:',
  '    steps: []',
  '',
].join('\n');

// Neither file defines a default (hidden/platform default applies).
const ROOT_YML_NO_DEFAULT = ['workflows:', '  primary:', '    steps: []', ''].join('\n');

const MERGED_YML_NO_DEFAULT = ['workflows:', '  primary:', '    steps: []', '  deploy:', '    steps: []', ''].join(
  '\n',
);

const MERGED_YML = [
  'meta:',
  '  bitrise.io:',
  '    stack: ubuntu-jammy-22.04-bitrise-2024',
  '    machine_type_id: standard',
  'workflows:',
  '  primary:',
  '    steps: []',
  '  deploy:',
  '    steps: []',
  '',
].join('\n');

const modularSlice = (nodeId: string, path: string, contents: string): FileSlice => {
  const doc = YmlUtils.toDoc(contents);
  return {
    nodeId,
    path,
    source: null,
    commitSha: MODULAR_SHA,
    editable: true,
    ymlDocument: doc,
    savedYmlDocument: doc,
  };
};

const modularTree = (rootContents: string, moduleContents: string): TreeNode => ({
  nodeId: 'root',
  path: 'bitrise.yml',
  contents: rootContents,
  source: null,
  commitSha: MODULAR_SHA,
  editable: true,
  includes: [
    {
      nodeId: 'n_mod',
      path: 'ci/deploy.yml',
      contents: moduleContents,
      source: { path: 'ci/deploy.yml', repository: null, branch: null, tag: null, commit: null },
      commitSha: MODULAR_SHA,
      editable: true,
      includes: [],
    },
  ],
});

const modularFiles = (rootContents: string, moduleContents: string) => ({
  root: modularSlice('root', 'bitrise.yml', rootContents),
  n_mod: modularSlice('n_mod', 'ci/deploy.yml', moduleContents),
});

const modularStore = ({
  rootContents,
  moduleContents,
  selectedNodeId,
  activeContents,
  mergedYml = MERGED_YML,
}: {
  rootContents: string;
  moduleContents: string;
  selectedNodeId: string;
  activeContents: string;
  mergedYml?: string;
}) => {
  const activeDoc = YmlUtils.toDoc(activeContents);
  return {
    tree: modularTree(rootContents, moduleContents),
    files: modularFiles(rootContents, moduleContents),
    selectedNodeId,
    mergedYml,
    ymlDocument: activeDoc,
    savedYmlDocument: activeDoc,
    yml: YmlUtils.toJSON(activeDoc),
  };
};

// Merged (read-only) view, default defined only in the root: a single card with "Defined in …" + the
// jump arrow on the card next to the selectors; the Workflows tab shows the same per-workflow.
export const ModularMergedView: Story = {
  parameters: {
    bitriseYmlStore: modularStore({
      rootContents: ROOT_YML,
      moduleContents: MODULE_YML,
      selectedNodeId: MERGED_CONFIG_NODE_ID,
      activeContents: MERGED_YML,
    }),
  },
};

// Merged view with the default defined in multiple modules: one read-only card per defining file
// (BIVS-3714), each with its own "Defined in …" + jump.
export const ModularMergedMultipleDefaults: Story = {
  parameters: {
    bitriseYmlStore: modularStore({
      rootContents: ROOT_YML,
      moduleContents: MODULE_YML_WITH_DEFAULT,
      selectedNodeId: MERGED_CONFIG_NODE_ID,
      activeContents: MERGED_YML,
    }),
  },
};

// Merged view where no module defines a default: a single card shows the hidden (platform) default,
// with no provenance or jump.
export const ModularMergedHiddenDefault: Story = {
  parameters: {
    bitriseYmlStore: modularStore({
      rootContents: ROOT_YML_NO_DEFAULT,
      moduleContents: MODULE_YML,
      selectedNodeId: MERGED_CONFIG_NODE_ID,
      activeContents: MERGED_YML_NO_DEFAULT,
      mergedYml: MERGED_YML_NO_DEFAULT,
    }),
  },
};

// A module file that doesn't define the default: the Default tab shows the inherited default read-only
// (sourced from the root), with a jump to where it's defined.
export const ModularModuleWithoutDefault: Story = {
  parameters: {
    bitriseYmlStore: modularStore({
      rootContents: ROOT_YML,
      moduleContents: MODULE_YML,
      selectedNodeId: 'n_mod',
      activeContents: MODULE_YML,
    }),
  },
};

// A module with no workflows: the Workflows tab shows the "No Workflows created yet" empty state
// (BIVS-3715). Switch to the Workflows tab to see it.
const MODULE_YML_NO_WORKFLOWS = [
  'meta:',
  '  bitrise.io:',
  '    stack: ubuntu-jammy-22.04-bitrise-2024',
  '    machine_type_id: standard',
  '',
].join('\n');

export const ModularWorkflowsTabEmpty: Story = {
  parameters: {
    bitriseYmlStore: modularStore({
      rootContents: ROOT_YML,
      moduleContents: MODULE_YML_NO_WORKFLOWS,
      selectedNodeId: 'n_mod',
      activeContents: MODULE_YML_NO_WORKFLOWS,
    }),
  },
};

export default meta;
