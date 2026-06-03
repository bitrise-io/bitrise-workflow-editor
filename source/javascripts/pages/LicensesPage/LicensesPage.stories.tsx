import { Meta } from '@storybook/react-vite';

import LicensePoolsApiMswMocks from '@/core/api/LicensePoolsApi.mswMocks';

import LicensesPage from './LicensesPage';

export default {
  component: LicensesPage,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta<typeof LicensesPage>;

export const WithoutLicenses = {
  parameters: {
    msw: {
      handlers: [LicensePoolsApiMswMocks.getWorkspaceLicensePools(true)],
    },
  },
};

export const WithLicenses = {
  parameters: {
    msw: {
      handlers: [LicensePoolsApiMswMocks.getWorkspaceLicensePools()],
    },
  },
};
