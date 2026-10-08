import { Meta, StoryObj } from '@storybook/react-vite';

import { getYmlSettings } from '@/pages/YmlPage/components/ConfigurationYmlStorage.mswMocks';

import Navigation from './Navigation';

export default {
  component: Navigation,

  beforeEach({ msw }) {
    msw.use(getYmlSettings());
  },
} as Meta<typeof Navigation>;

type Story = StoryObj<typeof Navigation>;

export const Default: Story = {};
