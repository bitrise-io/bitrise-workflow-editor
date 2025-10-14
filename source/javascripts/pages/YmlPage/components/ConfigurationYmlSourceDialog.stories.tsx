import { Meta, StoryObj } from '@storybook/react-webpack5';

import { getCiConfig, getYmlSettings, postCiConfig, putYmlSettings } from './ConfigurationYmlSource.mswMocks';
import ConfigurationYmlSourceDialog from './ConfigurationYmlSourceDialog';

const defaultMswHandlers = [getCiConfig(), putYmlSettings(), postCiConfig(), getYmlSettings()];

export default {
  component: ConfigurationYmlSourceDialog,
  args: {
    isOpen: true,
  },
  argTypes: {
    onClose: { type: 'function' },
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
