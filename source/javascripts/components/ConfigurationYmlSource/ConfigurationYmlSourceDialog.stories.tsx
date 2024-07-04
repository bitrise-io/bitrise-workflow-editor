import { Meta, StoryObj } from '@storybook/react';
import ConfigurationYmlSourceDialog from './ConfigurationYmlSourceDialog';
import { getConfig, putPipelineConfig } from './ConfigurationYmlSource.mswMocks';

export default {
  component: ConfigurationYmlSourceDialog,
  args: {
    isOpen: true,
    appSlug: '1c75ec44-ef64-4da0-8ab8-339f512eecc8',
  },
  parameters: {
    msw: [getConfig(), putPipelineConfig()],
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
