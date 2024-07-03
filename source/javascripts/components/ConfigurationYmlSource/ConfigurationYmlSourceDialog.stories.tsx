import { Meta, StoryObj } from '@storybook/react';
import ConfigurationYmlSourceDialog from './ConfigurationYmlSourceDialog';
import { getConfig } from './ConfigurationYmlSource.mswMocks';

export default {
  component: ConfigurationYmlSourceDialog,
  args: {
    isOpen: true,
  },
  parameters: {
    msw: [getConfig()],
  },
} as Meta<typeof ConfigurationYmlSourceDialog>;

export const StoreOnBitrise: StoryObj<typeof ConfigurationYmlSourceDialog> = {
  args: {
    initialUsesRepositoryYml: false,
  },
};

export const StoreOnGitRepository: StoryObj<typeof ConfigurationYmlSourceDialog> = {
  args: {
    initialUsesRepositoryYml: true,
  },
};
