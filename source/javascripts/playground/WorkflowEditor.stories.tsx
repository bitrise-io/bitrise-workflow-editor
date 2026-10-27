import '@/monaco-workers';

import { Box } from '@chakra-ui/react/box';
import { Meta, StoryObj } from '@storybook/react-vite';

import InitialDataLoader from '@/layouts/InitialDataLoader';
import MainLayout from '@/layouts/MainLayout';

import { SAMPLE_PROJECTS, sampleBridge, SampleProjectSlug } from './sampleBridge';
import { playgroundHandlers } from './startPlaygroundMocks';

// Prototype-only: the whole editor, as bitrise.io frames it, on the design playground's sample projects and
// mock API. For sharing design directions from a draft PR's Storybook; never for merging.
const WorkflowEditor = () => (
  <Box height="100dvh">
    <InitialDataLoader>
      <MainLayout />
    </InitialDataLoader>
  </Box>
);

export default {
  title: 'Prototypes/Workflow Editor',
  component: WorkflowEditor,
  parameters: { layout: 'fullscreen' },
} as Meta<typeof WorkflowEditor>;

type Story = StoryObj<typeof WorkflowEditor>;

type PlaygroundParent = Window & { playground?: typeof sampleBridge };

// Storybook's preview runtime turns HTMLElement.prototype.focus into a getter/setter. Ark's focus tracker
// (Bitkit v2) then redefines it as a value without `writable`, which leaves it read-only, and Chakra v2's
// tracker (Bitkit v1 Checkbox, e.g. in a Workflow's drawer) throws when it assigns it. Outside Storybook neither
// happens. Pinning it back to a plain writable value keeps it writable through Ark's redefinition.
const pinWritableFocus = () => {
  const { focus } = HTMLElement.prototype;
  Object.defineProperty(HTMLElement.prototype, 'focus', { configurable: true, writable: true, value: focus });
};

const onProject = (slug: SampleProjectSlug): Story => ({
  beforeEach: ({ msw }) => {
    pinWritableFocus();
    const project = SAMPLE_PROJECTS[slug];
    msw.use(...playgroundHandlers);
    (window.parent as PlaygroundParent).playground = sampleBridge;
    // The editor's flags and plan, as the Monolith passes them: modular editing for the modular sample, and
    // shared Secrets shown.
    window.parent.globalProps = {
      ...window.parent.globalProps,
      account: { ...window.parent.globalProps?.account, slug: 'sample-workspace', sharedResourcesAvailable: true },
      featureFlags: { account: project.editorFeatureFlags },
    } as typeof window.parent.globalProps;
    window.parent.pageProps = {
      ...window.parent.pageProps,
      project: { slug, name: project.title, defaultBranch: 'main', buildTriggerToken: 'sample-token' },
      abilities: { canRunBuilds: true, canChangeSettings: true },
      // The AI assistant needs the Monolith, so it shows as unavailable (sample data, hence the cast below).
      settings: { ai: { ciConfigExpert: { availability: 'unavailable' } } },
    } as unknown as typeof window.parent.pageProps;
    // Each visit starts fresh: on the default page, and with the first-run tour (on the branch that has it)
    // playing again.
    window.parent.location.hash = '';
    try {
      window.localStorage.removeItem('wfe-first-run-tour-seen');
    } catch {
      // Storage can be blocked; the tour then stays available from the rail.
    }

    return () => {
      delete (window.parent as PlaygroundParent).playground;
    };
  },
});

// acme-superapp: a modular config stored in the repository, 15 files deep.
export const ModularYaml: Story = { ...onProject('acme-superapp'), name: 'Modular YAML' };

// my-ios-app: one bitrise.yml, stored on bitrise.io.
export const YamlOnBitrise: Story = { ...onProject('my-ios-app'), name: 'YAML on bitrise.io' };
