import { Meta, StoryObj } from '@storybook/react-vite';

import { getCiConfig, getYmlSettings } from '@/pages/YmlPage/components/ConfigurationYmlStorage.mswMocks';

import ConfigSettingsBar from './ConfigSettingsBar';

export default {
  component: ConfigSettingsBar,
  args: {
    showValidationBadge: true,
    justifyContent: 'flex-start',
  },
  parameters: {
    msw: {
      handlers: [getCiConfig(), getYmlSettings()],
    },
  },
} as Meta<typeof ConfigSettingsBar>;

type Story = StoryObj<typeof ConfigSettingsBar>;

export const Valid: Story = {
  parameters: {
    bitriseYmlStore: {
      validationStatus: 'valid',
    },
  },
};

export const Warnings: Story = {
  parameters: {
    bitriseYmlStore: {
      validationStatus: 'warnings',
    },
  },
};

export const Invalid: Story = {
  parameters: {
    bitriseYmlStore: {
      validationStatus: 'invalid',
    },
  },
};
