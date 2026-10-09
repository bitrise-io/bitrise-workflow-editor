import { Box } from '@bitrise/bitkit';
import { Meta, StoryObj } from '@storybook/react-vite';
import * as monaco from 'monaco-editor';
import { http, HttpResponse } from 'msw';

import ConfigSettingsMenu from '@/components/unified-editor/ConfigSettingsMenu/ConfigSettingsMenu';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import YmlUtils from '@/core/utils/YmlUtils';
import { BACKGROUND_MODEL_URI } from '@/hooks/useYmlLanguageServices';

import YmlPage from './YmlPage';

type StoryType = StoryObj<typeof YmlPage>;

export default {
  component: YmlPage,
  beforeEach: ({ msw }) => {
    msw.use(
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
    );
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
  beforeEach({ msw }) {
    msw.use(
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
    );
  },
};

export const YmlStoredOnBitrise: StoryType = {};

// Aliases and a merge key: the alert says why the visual editor is off.
const YAML_ALIASES = `format_version: "13"
workflows:
  primary:
    envs:
    - &gradle_opts
      GRADLE_OPTS: -Xmx4g
    steps:
    - script@1: &unit_tests
        title: Unit tests
  release:
    envs:
    - *gradle_opts
    steps:
    - script@1:
        <<: *unit_tests
        title: Unit tests before release
`;
const YAML_ALIASES_DOC = YmlUtils.toDoc(YAML_ALIASES);

export const WithAliasesAndMergeKeys: StoryType = {
  parameters: {
    bitriseYmlStore: {
      ymlDocument: YAML_ALIASES_DOC,
      savedYmlDocument: YAML_ALIASES_DOC,
      __invalidYmlString: undefined,
    },
  },
};
