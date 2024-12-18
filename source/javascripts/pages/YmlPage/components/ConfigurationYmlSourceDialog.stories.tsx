import { Meta, StoryObj } from '@storybook/react';
import ConfigurationYmlSourceDialog from './ConfigurationYmlSourceDialog';
import {
  getConfig,
  getConfigFailed,
  postConfig,
  putPipelineConfig,
  putPipelineConfigFailed,
} from './ConfigurationYmlSource.mswMocks';

export default {
  component: ConfigurationYmlSourceDialog,
  args: {
    isOpen: true,
    projectSlug: '1c75ec44-ef64-4da0-8ab8-339f512eecc8',
    onClose: () => {},
    defaultBranch: 'main',
    gitRepoSlug: 'VoyagerGitRepo',
    lastModified: '2024-05-12T09:23:48.190Z',
    onConfigSourceChangeSaved: () => {},
    initialYmlRootPath: 'spongebob/squarepants',
    ciConfigYml: 'ciConfigYml content',
  },
  parameters: {
    msw: {
      handlers: [getConfig(), putPipelineConfig(), postConfig()],
    },
  },
} as Meta<typeof ConfigurationYmlSourceDialog>;

export const StoredOnBitrise: StoryObj<typeof ConfigurationYmlSourceDialog> = {
  args: {
    initialUsesRepositoryYml: false,
  },
};

export const StoredOnGitRepository: StoryObj<typeof ConfigurationYmlSourceDialog> = {
  args: {
    initialUsesRepositoryYml: true,
  },
};

export const StoringFailedOnGit: StoryObj<typeof ConfigurationYmlSourceDialog> = {
  args: {
    initialUsesRepositoryYml: false,
  },
  parameters: {
    msw: {
      handlers: [getConfigFailed()],
    },
  },
};

export const StoringFailedOnBitrise: StoryObj<typeof ConfigurationYmlSourceDialog> = {
  args: {
    initialUsesRepositoryYml: true,
  },
  parameters: {
    msw: {
      handlers: [getConfig(), postConfig(), putPipelineConfigFailed()],
    },
  },
};
