import { Meta, StoryObj } from '@storybook/react-vite';
import { delay, http, HttpResponse } from 'msw';

import { getCiConfig } from '@/pages/YmlPage/components/ConfigurationYmlSource.mswMocks';

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
      handlers: [formatYml(), getCiConfig()],
    },
  },
} as Meta<typeof UpdateConfigurationDialog>;

export const Default: StoryObj = {};

export const Failed: StoryObj = {
  parameters: {
    msw: {
      handlers: [
        formatYml(),
        getCiConfig(
          'config (/tmp/config20241207-26-5782vz.yaml) is not valid: trigger item #1: non-existent workflow defined as trigger target: primary',
        ),
      ],
    },
  },
};
