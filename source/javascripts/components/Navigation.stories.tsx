import { Meta, StoryObj } from '@storybook/react-vite';
import { set } from 'es-toolkit/compat';

import { getBranches, getCiConfig } from '@/components/unified-editor/SwitchBranchDialog/SwitchBranchDialog.mswMocks';
import { getYmlSettings } from '@/pages/YmlPage/components/ConfigurationYmlSource.mswMocks';

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
