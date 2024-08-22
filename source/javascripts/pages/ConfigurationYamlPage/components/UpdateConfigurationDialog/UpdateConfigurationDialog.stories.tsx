import { Meta, StoryObj } from '@storybook/react';
import { getConfig, getConfigFailed } from '@/core/api/BitriseYmlApi.mswMocks';
import UpdateConfigurationDialog from './UpdateConfigurationDialog';

export default {
  component: UpdateConfigurationDialog,
  args: {
    appSlug: '123',
    defaultBranch: 'main',
    gitRepoSlug: 'VoyagerGitRepo',
    getDataToSave: () => {
      return { key: 'value' };
    },
  },
  parameters: {
    msw: [getConfig()],
  },
} as Meta<typeof UpdateConfigurationDialog>;

export const Default: StoryObj = {};

export const Failed: StoryObj = {
  parameters: {
    msw: [getConfigFailed()],
  },
};
