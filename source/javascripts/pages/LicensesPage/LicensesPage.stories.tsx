import { Meta, StoryObj } from '@storybook/react-vite';

import LicensePoolsApiMswMocks from '@/core/api/LicensePoolsApi.mswMocks';

import LicensesPage from './LicensesPage';

export default {
  component: LicensesPage,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta<typeof LicensesPage>;

type Story = StoryObj<typeof LicensesPage>;

export const WithoutLicenses: Story = {
  beforeEach({ msw }) {
    msw.use(LicensePoolsApiMswMocks.getWorkspaceLicensePools(true));
  },
};

export const WithLicenses: Story = {
  beforeEach({ msw }) {
    msw.use(LicensePoolsApiMswMocks.getWorkspaceLicensePools());
  },
};
