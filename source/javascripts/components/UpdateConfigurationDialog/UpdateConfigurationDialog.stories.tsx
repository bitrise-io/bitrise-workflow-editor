import { Meta, StoryObj } from '@storybook/react/*';
import { getConfig } from '../ConfigurationYmlSource/ConfigurationYmlSource.mswMocks';
import UpdateConfigurationDialog from './UpdateConfigurationDialog';

export default {
  component: UpdateConfigurationDialog,
  args: {
    isOpen: true,
    appSlug: '123',
  },
  parameters: {
    msw: [getConfig()],
  },
} as Meta<typeof UpdateConfigurationDialog>;

export const Default: StoryObj = {};
