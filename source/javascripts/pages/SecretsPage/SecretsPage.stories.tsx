import { Meta, StoryObj } from '@storybook/react-vite';
import { set } from 'es-toolkit/compat';

import { getSecrets, getSecretsFromLocal } from '@/core/api/SecretApi.mswMocks';

import SecretsPage from './SecretsPage';

export default {
  component: SecretsPage,

  beforeEach({ msw }) {
    msw.use(getSecrets(), getSecretsFromLocal());
  },
} as Meta<typeof SecretsPage>;

type Story = StoryObj<typeof SecretsPage>;

export const SecretsPageEmptyState: Story = {
  beforeEach({ msw }) {
    msw.use(getSecretsFromLocal([]));
  },
};

export const Secrets: Story = {};

export const SecretsShared: Story = {
  beforeEach: () => {
    set(window, 'parent.globalProps.account.sharedResourcesAvailable', true);
    return () => {
      window.parent.globalProps = undefined;
    };
  },
};
