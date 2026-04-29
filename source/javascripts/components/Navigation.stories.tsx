import { Meta, StoryObj } from '@storybook/react-vite';

import { getYmlSettings } from '@/pages/YmlPage/components/ConfigurationYmlSource.mswMocks';

import Navigation from './Navigation';

export default {
  component: Navigation,
  parameters: {
    msw: {
      handlers: [getYmlSettings()],
    },
  },
} as Meta<typeof Navigation>;

type Story = StoryObj<typeof Navigation>;

export const StoredOnBitrise: Story = {};

export const StoredInRepository: Story = {
  parameters: {
    msw: {
      handlers: [getYmlSettings({ uses_repository_yml: true })],
    },
  },
};
