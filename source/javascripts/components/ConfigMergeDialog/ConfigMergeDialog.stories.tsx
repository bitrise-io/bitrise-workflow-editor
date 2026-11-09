import { Meta, StoryObj } from '@storybook/react-vite';
import { delay, http, HttpResponse } from 'msw';

import BitriseYmlApi from '@/core/api/BitriseYmlApi';
import { bitriseYmlStore } from '@/core/stores/BitriseYmlStore';
import YmlUtils from '@/core/utils/YmlUtils';

import ConfigMergeDialog from './ConfigMergeDialog';
import { baseYaml, remoteYaml, yourYaml } from './ConfigMergeDialog.mocks';

type Story = StoryObj<typeof ConfigMergeDialog>;

const storeState = {
  yml: TEST_BITRISE_YML,
  ymlDocument: YmlUtils.toDoc(yourYaml),
  savedYmlDocument: YmlUtils.toDoc(baseYaml),
  savedYmlVersion: '',
};

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

  beforeEach({ msw }) {
    bitriseYmlStore.setState(storeState);
    msw.use(
      http.get(BitriseYmlApi.ciConfigPath({ projectSlug: ':slug' }), async () => {
        await delay();
        return HttpResponse.text(remoteYaml);
      }),
    );
  },

  parameters: {
    bitriseYmlStore: storeState,
  },
};

export const Default: Story = {};

export const WithError: Story = {
  beforeEach({ msw }) {
    msw.use(
      http.get(BitriseYmlApi.ciConfigPath({ projectSlug: ':slug' }), async () => {
        await delay();
        return HttpResponse.json({ error_msg: 'Error message' }, { status: 422 });
      }),
    );
  },
};

export default meta;
