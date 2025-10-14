import { Meta, StoryObj } from '@storybook/react-webpack5';
import { delay, http, HttpResponse } from 'msw';

import BitriseYmlApi from '@/core/api/BitriseYmlApi';
import YmlUtils from '@/core/utils/YmlUtils';

import ConfigMergeDialog from './ConfigMergeDialog';
import { baseYaml, remoteYaml, yourYaml } from './ConfigMergeDialog.mocks';

type Story = StoryObj<typeof ConfigMergeDialog>;

const meta: Meta<typeof ConfigMergeDialog> = {
  component: ConfigMergeDialog,
  args: {
    isOpen: true,
  },
  argTypes: {
    onClose: {
      type: 'function',
    },
  },
  parameters: {
    msw: {
      handlers: [
        http.get(BitriseYmlApi.ciConfigPath({ projectSlug: ':slug' }), async () => {
          await delay();
          return HttpResponse.text(remoteYaml);
        }),
      ],
    },
    bitriseYmlStore: {
      yml: TEST_BITRISE_YML,
      ymlDocument: YmlUtils.toDoc(yourYaml),
      savedYmlDocument: YmlUtils.toDoc(baseYaml),
      savedYmlVersion: '',
    },
  },
};

export const Default: Story = {};

export const WithError: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(BitriseYmlApi.ciConfigPath({ projectSlug: ':slug' }), async () => {
          await delay();
          return HttpResponse.json({ error_msg: 'Error message' }, { status: 422 });
        }),
      ],
    },
  },
};

export default meta;
