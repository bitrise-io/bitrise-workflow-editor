import { Meta, StoryObj } from '@storybook/react-vite';
import { Document } from 'yaml';

import { TreeNode } from '@/core/models/Tree';
import {
  bitriseYmlStore,
  initializeBitriseYmlDocument,
  initializeModularConfig,
  updateBitriseYmlDocumentByString,
  updateFileDocumentByString,
} from '@/core/stores/BitriseYmlStore';

import RootErrorBoundary from './RootErrorBoundary';

export const YML = 'workflows:\n  primary:\n    steps:\n    - git-clone@8: {}\n';
export const EDITED_YML = `${YML}  deploy: {}\n`;
export const ROOT_YML = 'include:\n- path: modules/workflows.yml\n';
export const EDITED_ROOT_YML = `${ROOT_YML}format_version: "13"\n`;
export const UNPARSEABLE_YML = 'workflows:\n  primary: {\n';
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

function initModular() {
  initializeModularConfig({
    root: node('n_root', 'bitrise.yml', ROOT_YML, [node('n_wf', 'modules/workflows.yml', YML)]),
    mergedYml: YML,
  });
}

// The error page reads the store and the hash once, while it renders, so both are seeded here
// rather than through `parameters.bitriseYmlStore`, which the preview only applies after render.
// In Storybook `window.parent` is the manager, so its hash is put back afterwards.
function onPage(hash: string, seed: () => void = () => {}) {
  return () => {
    const previousHash = window.parent.location.hash;
    window.parent.location.hash = hash;
    bitriseYmlStore.setState({
      ymlDocument: new Document(),
      savedYmlDocument: new Document(),
      __invalidYmlString: undefined,
      __savedInvalidYmlString: undefined,
      tree: undefined,
      files: {},
    });
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
  beforeEach: onPage('#!/workflows', () => initializeBitriseYmlDocument({ ymlString: YML, version: '' })),
};

export const BeforeTheConfigLoaded: Story = {
  beforeEach: onPage('#!/workflows'),
};

export const OnTheYamlPage: Story = {
  beforeEach: onPage('#!/yml', () => initializeBitriseYmlDocument({ ymlString: YML, version: '' })),
};

export const OnABranch: Story = {
  beforeEach: onPage('#!/workflows?branch=feature-x', () =>
    initializeBitriseYmlDocument({ ymlString: YML, version: '' }),
  ),
};

export const UnsavedChanges: Story = {
  beforeEach: onPage('#!/workflows', () => {
    initializeBitriseYmlDocument({ ymlString: YML, version: '' });
    updateBitriseYmlDocumentByString(EDITED_YML);
  }),
};

export const UnsavedEditThatDoesNotParse: Story = {
  beforeEach: onPage('#!/yml', () => {
    initializeBitriseYmlDocument({ ymlString: YML, version: '' });
    updateBitriseYmlDocumentByString(EDITED_YML);
    updateBitriseYmlDocumentByString(UNPARSEABLE_YML);
  }),
};

export const ModularOneFileUnsaved: Story = {
  beforeEach: onPage('#!/workflows', () => {
    initModular();
    updateFileDocumentByString('n_wf', EDITED_YML);
  }),
};

export const ModularEveryFileUnsaved: Story = {
  beforeEach: onPage('#!/workflows', () => {
    initModular();
    updateFileDocumentByString('n_root', EDITED_ROOT_YML);
    updateFileDocumentByString('n_wf', EDITED_YML);
  }),
};

export const NotAnErrorThrown: Story = {
  args: { thrown: undefined },
  beforeEach: onPage('#!/workflows', () => initializeBitriseYmlDocument({ ymlString: YML, version: '' })),
};

export const UnsavedEditToAConfigThatNeverParsed: Story = {
  beforeEach: onPage('#!/workflows', () => {
    initializeBitriseYmlDocument({ ymlString: UNPARSEABLE_YML, version: '' });
    updateBitriseYmlDocumentByString(OTHER_UNPARSEABLE_YML);
  }),
};

export const ErrorWithoutAMessage: Story = {
  args: { thrown: new Error('') },
  beforeEach: onPage('#!/workflows', () => initializeBitriseYmlDocument({ ymlString: YML, version: '' })),
};

export const UnprintableValueThrown: Story = {
  args: { thrown: Object.create(null) },
  beforeEach: onPage('#!/workflows', () => initializeBitriseYmlDocument({ ymlString: YML, version: '' })),
};
