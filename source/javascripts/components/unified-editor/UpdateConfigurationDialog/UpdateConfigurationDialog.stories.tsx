import { Meta, StoryObj } from '@storybook/react';
import { delay, http, HttpResponse } from 'msw';

import { getConfig, getConfigFailed } from '@/pages/YmlPage/components/ConfigurationYmlSource.mswMocks';

import UpdateConfigurationDialog from './UpdateConfigurationDialog';

const formatYml = () => {
  return http.post('/api/cli/format', async () => {
    await delay();
    return new HttpResponse('formatted ciConfigYml content from API', {
      status: 200,
    });
  });
};

export default {
  component: UpdateConfigurationDialog,
  args: {
    isOpen: true,
  },
  argTypes: {
    onClose: { type: 'function' },
  },
  parameters: {
    msw: {
      handlers: [formatYml(), getConfig()],
    },
  },
} as Meta<typeof UpdateConfigurationDialog>;

export const Default: StoryObj = {};

export const Failed: StoryObj = {
  parameters: {
    msw: {
      handlers: [formatYml(), getConfigFailed()],
    },
  },
};
