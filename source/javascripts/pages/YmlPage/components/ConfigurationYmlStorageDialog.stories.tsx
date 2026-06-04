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
  beforeEach: () => {
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
  parameters: {
    msw: {
      handlers: [...defaultMswHandlers],
    },
  },
} as Meta<typeof ConfigurationYmlSourceDialog>;

type Story = StoryObj<typeof ConfigurationYmlSourceDialog>;

export const StoredOnBitrise: Story = {};

export const StoredOnGitRepository: Story = {
  parameters: {
    msw: {
      handlers: [getYmlSettings({ uses_repository_yml: true, yml_root_path: '' }), ...defaultMswHandlers],
    },
  },
};

export const SaveCIConfigSettingsFailed: Story = {
  parameters: {
    msw: {
      handlers: [putYmlSettings('Save CI config settings failed.'), ...defaultMswHandlers],
    },
  },
};

export const FetchCIConfigFailed: Story = {
  parameters: {
    msw: {
      handlers: [getCiConfig('Get CI confit from Git repository failed.'), ...defaultMswHandlers],
    },
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
