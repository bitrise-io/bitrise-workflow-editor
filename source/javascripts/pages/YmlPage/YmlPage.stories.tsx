import { Box } from '@bitrise/bitkit';
import { Meta, StoryObj } from '@storybook/react-vite';
import * as monaco from 'monaco-editor';
import { http, HttpResponse } from 'msw';

import ConfigSettingsMenu from '@/components/unified-editor/ConfigSettingsMenu/ConfigSettingsMenu';
import MonacoUtils from '@/core/utils/MonacoUtils';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import YmlUtils from '@/core/utils/YmlUtils';
import { BACKGROUND_MODEL_URI } from '@/hooks/useYmlLanguageServices';

import YmlPage from './YmlPage';

type StoryType = StoryObj<typeof YmlPage>;

export default {
  component: YmlPage,
  beforeEach: () => {
    // The editor keeps its model across unmounts, and in the app the language services keep it in
    // sync with the store. Stories don't mount those, so without this a story shows the last one's YAML.
    monaco.editor.getModel(BACKGROUND_MODEL_URI)?.dispose();
    window.parent.pageProps = {
      ...window.parent.pageProps,
      limits: { isRepositoryYmlAvailable: true },
      project: {
        buildTriggerToken: 'token',
        defaultBranch: 'master',
        gitRepoSlug: 'git-slug',
        name: 'Storybook project',
        slug: 'project-slug',
      },
    };
  },
  decorators: [
    (Story) => (
      <Box height="calc(100dvh - 2rem)" display="flex" flexDirection="column">
        {RuntimeUtils.isWebsiteMode() && <ConfigSettingsMenu />}
        <Story />
      </Box>
    ),
  ],
  parameters: {
    msw: {
      handlers: [
        http.get('app/:projectSlug/pipeline_config', () => {
          return HttpResponse.json({
            is_modular_yaml_supported: true,
            is_yml_split: false,
            last_modified: '2024-12-03',
            lines: 5000,
            uses_repository_yml: false,
            yml_root_path: '',
          });
        }),
      ],
    },
  },
} as Meta<typeof YmlPage>;

export const CliMode: StoryType = {
  beforeEach: () => {
    window.env.MODE = 'CLI';
    window.parent.pageProps = undefined;
    window.parent.globalProps = undefined;
  },
};

export const RepositoryYmlAvailableLimitIsFalse: StoryType = {
  beforeEach: () => {
    window.parent.pageProps = {
      ...window.parent.pageProps,
      limits: { isRepositoryYmlAvailable: false },
    };
  },
};

export const YmlStoredOnGit: StoryType = {
  parameters: {
    msw: {
      handlers: [
        http.get('app/:projectSlug/pipeline_config', () => {
          return HttpResponse.json({
            is_modular_yaml_supported: true,
            is_yml_split: false,
            last_modified: '2024-12-03',
            lines: 5000,
            uses_repository_yml: true,
            yml_root_path: '',
          });
        }),
      ],
    },
  },
};

export const YmlStoredOnBitrise: StoryType = {};

const ALIASES = `format_version: "13"
default_step_lib_source: https://github.com/bitrise-io/bitrise-steplib.git
project_type: android

workflows:
  primary:
    steps:
    - &clone
      git-clone@8: {}
    - &unit_tests
      script@1:
        title: Unit tests
        inputs:
        - content: ./gradlew testDebugUnitTest
  nightly:
    steps:
    - *clone
    - *unit_tests
`;

const ALIASES_AND_MERGE_KEYS = `format_version: "13"
default_step_lib_source: https://github.com/bitrise-io/bitrise-steplib.git
project_type: android

workflows:
  primary:
    envs:
    - &gradle_opts
      GRADLE_OPTS: -Xmx4g
    steps:
    - &clone
      git-clone@8: {}
    - script@1: &unit_tests
        title: Unit tests
        inputs:
        - content: ./gradlew testDebugUnitTest
  release:
    envs:
    - *gradle_opts
    steps:
    - *clone
    - script@1:
        <<: *unit_tests
        title: Unit tests before release
`;

/** `bitriseYmlStore` story parameters for a config the visual editor refuses. */
function storeState(yml: string) {
  const doc = YmlUtils.toDoc(yml);
  return { ymlDocument: doc, savedYmlDocument: doc, __invalidYmlString: undefined };
}

// The visual editor is off for these: the alert says why, and each alias, anchor and merge key is
// marked. The app wires the markers up in InitialDataLoader, which a page story doesn't mount.
const withYamlSharingMarkers = () => MonacoUtils.configureForYaml(monaco);

export const WithAliases: StoryType = {
  beforeEach: withYamlSharingMarkers,
  parameters: { bitriseYmlStore: storeState(ALIASES) },
};

export const WithAliasesAndMergeKeys: StoryType = {
  beforeEach: withYamlSharingMarkers,
  parameters: { bitriseYmlStore: storeState(ALIASES_AND_MERGE_KEYS) },
};
