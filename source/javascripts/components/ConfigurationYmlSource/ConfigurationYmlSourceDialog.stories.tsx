import { Meta, StoryObj } from '@storybook/react';
import ConfigurationYmlSourceDialog from './ConfigurationYmlSourceDialog';

export default {
  component: ConfigurationYmlSourceDialog,
  args: {
    isOpen: true,
    initialUsesRepositoryYml: false,
  },
} as Meta<typeof ConfigurationYmlSourceDialog>;

export const Default: StoryObj<typeof ConfigurationYmlSourceDialog> = {};
