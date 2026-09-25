import { Meta, StoryObj } from '@storybook/react-vite';

import { TreeNode } from '@/core/models/Tree';
import WorkflowService from '@/core/services/WorkflowService';
import {
  initializeBitriseYmlDocument,
  initializeModularConfig,
  selectNode,
  updateBitriseYmlDocumentByString,
  updateFileDocumentByString,
} from '@/core/stores/BitriseYmlStore';

import RootErrorBoundary from './RootErrorBoundary';

export const YML = 'workflows:\n  primary:\n    steps:\n    - git-clone@8: {}\n';
const ROOT_YML = 'include:\n- path: modules/workflows.yml\n';
export const UNPARSEABLE_YML = 'workflows:\n  primary: {\n';
export const EDITED_YML = `${YML}  deploy: {}\n`;
export const EDITED_ROOT_YML = `${ROOT_YML}format_version: "13"\n`;
export const OTHER_UNPARSEABLE_YML = 'workflows:\n  deploy: {\n';

const Crash = ({ thrown }: { thrown: unknown }): never => {
  throw thrown;
};

/** A page that throws on every render, inside the boundary the app mounts at its root. */
const CrashingPage = ({ thrown }: { thrown: unknown }) => (
  <RootErrorBoundary>
    <Crash thrown={thrown} />
  </RootErrorBoundary>
);

function node(nodeId: string, path: string, contents: string, includes: TreeNode[] = []): TreeNode {
  return { nodeId, path, contents, source: null, commitSha: 'sha', editable: true, includes };
}

function loadYml(ymlString = YML) {
  initializeBitriseYmlDocument({ ymlString, version: '' });
}

function loadModular(moduleYml = YML) {
  initializeModularConfig({
    root: node('n_root', 'bitrise.yml', ROOT_YML, [node('n_wf', 'modules/workflows.yml', moduleYml)]),
    mergedYml: YML,
  });
}

// The error page reads the store and the hash once, while it renders, so both are seeded here
// rather than through `parameters.bitriseYmlStore`, which the preview only applies after render.
// In Storybook `window.parent` is the manager, so its hash is put back afterwards.
function onPage(hash: string, seed: () => void = loadYml) {
  return () => {
    const previousHash = window.parent.location.hash;
    window.parent.location.hash = hash;
    seed();
    return () => {
      window.parent.location.hash = previousHash;
    };
  };
}

export default {
  component: CrashingPage,
  // The fixtures are exported for the spec's assertions, not as stories.
  excludeStories: /YML$/,
  args: { thrown: new Error("Cannot read properties of undefined (reading 'steps')") },
  argTypes: { thrown: { control: false } },
  parameters: { layout: 'fullscreen' },
} as Meta<typeof CrashingPage>;

type Story = StoryObj<typeof CrashingPage>;

export const NothingUnsaved: Story = {
  beforeEach: onPage('#!/workflows'),
};

export const BeforeTheConfigLoaded: Story = {
  beforeEach: onPage('#!/workflows', () => loadYml('')),
};

export const OnTheYamlPage: Story = {
  beforeEach: onPage('#!/yml'),
};

export const OnABranch: Story = {
  beforeEach: onPage('#!/workflows?branch=feature-x'),
};

export const UnsavedChanges: Story = {
  beforeEach: onPage('#!/workflows', () => {
    loadYml();
    updateBitriseYmlDocumentByString(EDITED_YML);
  }),
};

export const UnsavedVisualEdit: Story = {
  beforeEach: onPage('#!/workflows', () => {
    loadYml();
    WorkflowService.createWorkflow('deploy');
  }),
};

export const UnsavedEditThatDoesNotParse: Story = {
  beforeEach: onPage('#!/yml', () => {
    loadYml();
    updateBitriseYmlDocumentByString(EDITED_YML);
    updateBitriseYmlDocumentByString(UNPARSEABLE_YML);
  }),
};

export const UnsavedEditToAConfigThatNeverParsed: Story = {
  beforeEach: onPage('#!/workflows', () => {
    loadYml(UNPARSEABLE_YML);
    updateBitriseYmlDocumentByString(OTHER_UNPARSEABLE_YML);
  }),
};

// The Save button counts no changes here, so neither does the error page.
export const TypedBackTheSavedTextOfAConfigThatNeverParsed: Story = {
  beforeEach: onPage('#!/yml', () => {
    loadYml(UNPARSEABLE_YML);
    updateBitriseYmlDocumentByString(YML);
    updateBitriseYmlDocumentByString(UNPARSEABLE_YML);
  }),
};

export const ModularOneFileUnsaved: Story = {
  beforeEach: onPage('#!/workflows', () => {
    loadModular();
    updateFileDocumentByString('n_wf', EDITED_YML);
  }),
};

export const ModularEveryFileUnsaved: Story = {
  beforeEach: onPage('#!/workflows', () => {
    loadModular();
    updateFileDocumentByString('n_root', EDITED_ROOT_YML);
    updateFileDocumentByString('n_wf', EDITED_YML);
  }),
};

export const ModularEditThatDoesNotParse: Story = {
  beforeEach: onPage('#!/yml', () => {
    loadModular();
    selectNode('n_wf');
    updateBitriseYmlDocumentByString(UNPARSEABLE_YML);
  }),
};

export const ModularEditToAModuleThatNeverParsed: Story = {
  beforeEach: onPage('#!/yml', () => {
    loadModular(UNPARSEABLE_YML);
    selectNode('n_wf');
    updateBitriseYmlDocumentByString(OTHER_UNPARSEABLE_YML);
  }),
};

export const NotAnErrorThrown: Story = { ...NothingUnsaved, args: { thrown: undefined } };

export const ErrorWithoutAMessage: Story = { ...NothingUnsaved, args: { thrown: new Error('') } };

export const UnprintableValueThrown: Story = { ...NothingUnsaved, args: { thrown: Object.create(null) } };
