import { StoryObj } from '@storybook/react';
import ConfigurationYmlSourceDialog from './ConfigurationYmlSourceDialog';

export default {
  component: ConfigurationYmlSourceDialog,
  args: {
    isOpen: true,
  },
};

export const Default: StoryObj<typeof ConfigurationYmlSourceDialog> = {};
