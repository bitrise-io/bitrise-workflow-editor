import { Meta, StoryObj } from '@storybook/react-vite';
import { set } from 'es-toolkit/compat';
import { delay, http, HttpResponse } from 'msw';

import { getBranches, getCiConfig } from '@/components/unified-editor/SwitchBranchDialog/SwitchBranchDialog.mswMocks';
import { GetBranchesResult } from '@/core/api/BranchesApi';
import { getYmlSettings } from '@/pages/YmlPage/components/ConfigurationYmlStorage.mswMocks';

import Navigation from './Navigation';

export default {
  component: Navigation,
  beforeEach: () => {
    set(window, 'parent.globalProps.featureFlags.account.enable-branch-switching', true);
  },
  parameters: {
    msw: {
      handlers: [getBranches(), getCiConfig(), getYmlSettings()],
    },
  },
} as Meta<typeof Navigation>;

type Story = StoryObj<typeof Navigation>;

export const StoredOnBitrise: Story = {};

export const StoredInRepository: Story = {
  parameters: {
    msw: {
      handlers: [getBranches(), getCiConfig(), getYmlSettings({ uses_repository_yml: true })],
    },
  },
};

export const SwitchBranchError: Story = {
  parameters: {
    msw: {
      handlers: [getBranches(), getCiConfig('Failed to load bitrise.yml from branch'), getYmlSettings()],
    },
  },
};

export const SwitchBranchSingleOption: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/app/:appSlug/git-branches', async (): Promise<Response> => {
          await delay();
          return HttpResponse.json<GetBranchesResult>({ branches: ['main'] });
        }),
        getCiConfig(),
        getYmlSettings(),
      ],
    },
  },
};
