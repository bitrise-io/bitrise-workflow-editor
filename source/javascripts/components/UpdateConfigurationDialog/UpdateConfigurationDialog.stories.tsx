import { Meta, StoryObj } from '@storybook/react/*';
import UpdateConfigurationDialog from './UpdateConfigurationDialog';

export default {
  component: UpdateConfigurationDialog,
  args: {
    isOpen: true,
  },
} as Meta<typeof UpdateConfigurationDialog>;

export const Default: StoryObj = {};
