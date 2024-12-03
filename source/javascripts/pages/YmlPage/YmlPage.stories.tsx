import { Meta, StoryObj } from '@storybook/react';
import { Box } from '@bitrise/bitkit';
import BitriseYmlApi from '@/core/api/BitriseYmlApi';
import YmlPage from './YmlPage';

type StoryType = StoryObj<typeof YmlPage>;

export default {
  component: YmlPage,
  args: {
    ciConfigYml: BitriseYmlApi.toYml(TEST_BITRISE_YML),
    ymlSettings: {
      isModularYamlSupported: true,
      isYmlSplit: false,
      lastModified: '2024-12-03',
      lines: 5000,
      usesRepositoryYml: false,
      ymlRootPath: '',
    },
  },
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
} as Meta<typeof YmlPage>;

export const CliMode: StoryType = {
  beforeEach: () => {
    process.env.MODE = 'cli';
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
  args: {
    ymlSettings: {
      isModularYamlSupported: true,
      isYmlSplit: false,
      lastModified: '2024-12-03',
      lines: 5000,
      usesRepositoryYml: true,
      ymlRootPath: '',
    },
  },
};

export const YmlStoredOnBitrise: StoryType = {};
