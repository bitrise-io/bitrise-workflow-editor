import { Meta } from '@storybook/react';
import LicensePoolsApiMswMocks from '@/core/api/LicensePoolsApi.mswMocks';
import LicensesPage from './LicensesPage';

export default {
  component: LicensesPage,
  args: {
    yml: TEST_BITRISE_YML,
  },
  argTypes: {
    onChange: { type: 'function' },
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
