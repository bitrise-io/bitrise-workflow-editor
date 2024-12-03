import { Meta, StoryObj } from '@storybook/react';
import { getSecrets, getSecretsFromLocal } from '@/core/api/SecretApi.mswMocks';
import SecretsPage from './SecretsPage';

export default {
  component: SecretsPage,
  args: {
    appSlug: 'app-slug',
    onSecretsChange: console.log,
    sharedSecretsAvailable: false,
  },
  parameters: {
    msw: {
      handlers: [getSecrets(), getSecretsFromLocal()],
    },
  },
} as Meta<typeof SecretsPage>;

export const SecretsPageEmptyState: StoryObj<typeof SecretsPage> = {
  parameters: {
    msw: { handlers: [getSecretsFromLocal([])] },
  },
};

export const Secrets: StoryObj<typeof SecretsPage> = {};

export const SecretsShared: StoryObj<typeof SecretsPage> = {
  args: {
    sharedSecretsAvailable: true,
  },
};
