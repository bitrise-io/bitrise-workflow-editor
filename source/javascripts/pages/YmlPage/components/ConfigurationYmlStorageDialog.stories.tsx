import { Meta, StoryObj } from '@storybook/react-vite';

import { getCiConfig, getYmlSettings, postCiConfig, putYmlSettings } from './ConfigurationYmlStorage.mswMocks';
import ConfigurationYmlSourceDialog from './ConfigurationYmlStorageDialog';

const defaultMswHandlers = [getCiConfig(), putYmlSettings(), postCiConfig(), getYmlSettings()];

export default {
  component: ConfigurationYmlSourceDialog,
  args: {
    isOpen: true,
  },
  argTypes: {
    onClose: { type: 'function' },
  },
  beforeEach: ({ msw }) => {
    msw.use(...defaultMswHandlers);
    window.parent.pageProps = {
      ...window.parent.pageProps,
      project: {
        ...window.parent.pageProps?.project,
        name: 'Storybook project',
        slug: 'project-slug',
        defaultBranch: 'master',
        gitRepoSlug: 'bitrise-io-ios-xcode80-today-extension',
      },
    };
  },
} as Meta<typeof ConfigurationYmlSourceDialog>;

type Story = StoryObj<typeof ConfigurationYmlSourceDialog>;

export const StoredOnBitrise: Story = {};

export const StoredOnGitRepository: Story = {
  beforeEach({ msw }) {
    msw.use(getYmlSettings({ uses_repository_yml: true, yml_root_path: '' }), ...defaultMswHandlers);
  },
};

export const SaveCIConfigSettingsFailed: Story = {
  beforeEach({ msw }) {
    msw.use(putYmlSettings('Save CI config settings failed.'), ...defaultMswHandlers);
  },
};

export const FetchCIConfigFailed: Story = {
  beforeEach({ msw }) {
    msw.use(getCiConfig('Get CI confit from Git repository failed.'), ...defaultMswHandlers);
  },
};

// export const StoredOnBitrise: StoryObj<typeof ConfigurationYmlSourceDialog> = {
//   args: {
//     initialUsesRepositoryYml: false,
//   },
// };

// export const StoredOnGitRepository: StoryObj<typeof ConfigurationYmlSourceDialog> = {
//   args: {
//     initialUsesRepositoryYml: true,
//   },
// };

// export const StoringFailedOnGit: StoryObj<typeof ConfigurationYmlSourceDialog> = {
//   args: {
//     initialUsesRepositoryYml: false,
//   },
//   parameters: {
//     msw: {
//       handlers: [getConfigFailed()],
//     },
//   },
// };

// export const StoringFailedOnBitrise: StoryObj<typeof ConfigurationYmlSourceDialog> = {
//   args: {
//     initialUsesRepositoryYml: true,
//   },
//   parameters: {
//     msw: {
//       handlers: [getCiConfig(), postCiConfig(), putPipelineConfigFailed()],
//     },
//   },
// };
