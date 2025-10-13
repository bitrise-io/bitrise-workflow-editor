import { Box } from '@bitrise/bitkit';
import { Meta, StoryObj } from '@storybook/react-webpack5';
import { http, HttpResponse } from 'msw';

import YmlPage from './YmlPage';

type StoryType = StoryObj<typeof YmlPage>;

export default {
  component: YmlPage,
  beforeEach: () => {
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
      <Box height="calc(100dvh - 2rem)">
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
    window.MODE = 'cli';
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
